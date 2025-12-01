import express from 'express';
import bodyParser from 'body-parser';
import { initializeDatabase } from './database_core.js';
import { registerUser, loginUser, authenticateToken } from './auth.js';
import cors from 'cors';
import {
  createProduct,
  getProductByBarcode,
  getAllProducts,
  updateProduct,
  deleteProduct,
  addInventoryBatch,
  updateInventoryBatch,
  deleteInventoryBatch,
  getProductStockLevel,
  reduceInventoryFIFO,
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
  linkSupplierToProduct,
  createTransaction,
  getTransactionHistory,
  updateTransaction,
  deleteTransaction,
  getLowStockAlerts,
  getDailySalesTotal,
  getTransactionsBySupplier,
  getTransactionsByCustomer,
  getInventoryByProduct,
  getSuppliersByProduct,
  getAllSupplierProductLinks,
  getProductsBySupplier,
  updateSupplierProductPricing,
  unlinkSupplierFromProduct,
  getSalesTrends,
  getTopProducts,
  getInventoryTurnover,
  getProfitMargin,
  getCustomerLifetimeValue,
  getSupplierPerformance,
  getInventoryValuation,
  getPaymentAnalysis,
  getUserAnalytics
} from './database_ops.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Configuration
const STATS_FILE_PATH = path.join(__dirname, '../stats.json');
const AUTO_SAVE_INTERVAL_HOURS = 6; // Auto-save stats every 6 hours

app.use(bodyParser.json());
app.use(cors());

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        shop_name: string;
        folder_hash: string;
      };
    }
  }
}

// ============================================
// STATISTICS MANAGEMENT (PUBLIC & PRIVATE)
// ============================================

// Function to collect and save statistics
async function saveAllStatistics(): Promise<void> {
  try {
    console.log('Starting statistics collection...');
    
    // Import dynamically to avoid circular dependencies
    const { db } = await import('./database_core.js');
    
    // Get all users from main database
    const users = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT id, shop_name, folder_hash FROM users', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows as any[]);
      });
    });
    
    const usersAnalytics = [];
    
    // Collect analytics for each user
    for (const user of users) {
      try {
        console.log(`Collecting analytics for user: ${user.shop_name} (ID: ${user.id})`);
        
        const analytics = await getUserAnalytics(
          user.folder_hash,
          user.id,
          user.shop_name
        );
        
        usersAnalytics.push(analytics);
        
        console.log(`Completed analytics for user: ${user.shop_name}`);
      } catch (userError) {
        console.error(`Failed to collect analytics for user ${user.id}:`, userError);
      }
    }
    
    // Create statistics summary
    const summary = {
      timestamp: new Date().toISOString(),
      total_users: users.length,
      users_analytics: usersAnalytics
    };
    
    // Save to JSON file
    await fs.writeFile(STATS_FILE_PATH, JSON.stringify(summary, null, 2), 'utf-8');
    
    console.log(`Statistics saved to ${STATS_FILE_PATH} at ${summary.timestamp}`);
    console.log(`Collected analytics for ${usersAnalytics.length}/${users.length} users`);
    
  } catch (error) {
    console.error('Failed to save statistics:', error);
    throw error;
  }
}

// Schedule periodic statistics saving
let statsInterval: NodeJS.Timeout | null = null;

function startStatsCollection(intervalHours: number = AUTO_SAVE_INTERVAL_HOURS): void {
  if (statsInterval) {
    clearInterval(statsInterval);
  }
  
  // Save immediately on start
  saveAllStatistics().catch(console.error);
  
  // Schedule periodic saves
  const intervalMs = intervalHours * 60 * 60 * 1000;
  statsInterval = setInterval(() => {
    console.log(`Auto-saving statistics (every ${intervalHours} hours)...`);
    saveAllStatistics().catch(console.error);
  }, intervalMs);
  
  console.log(`Statistics collection scheduled every ${intervalHours} hours`);
}

function stopStatsCollection(): void {
  if (statsInterval) {
    clearInterval(statsInterval);
    statsInterval = null;
    console.log('Statistics collection stopped');
  }
}

async function triggerStatsSave(): Promise<boolean> {
  try {
    await saveAllStatistics();
    return true;
  } catch (error) {
    console.error('Manual stats save failed:', error);
    return false;
  }
}

// Initialize database and start auto-save
initializeDatabase().then(() => {
  console.log('Database initialized successfully');
  startStatsCollection();
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// ============================================
// PUBLIC ENDPOINTS (NO AUTHENTICATION REQUIRED)
// ============================================

// Registration
app.post('/api/register', async (req, res) => {
  const { shopName, email, password } = req.body;

  if (!shopName || !email || !password) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const result = await registerUser(shopName, email, password);

  if (result.success) {
    return res.status(201).json({ success: true, token: result.token });
  } else {
    const statusCode = result.error === 'Email already registered' ? 409 : 500;
    return res.status(statusCode).json({ success: false, error: result.error });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const result = await loginUser(email, password);

  if (result.success) {
    return res.json({ success: true, token: result.token });
  } else {
    const statusCode = result.error === 'Invalid credentials' ? 401 : 500;
    return res.status(statusCode).json({ success: false, error: result.error });
  }
});

// PUBLIC STATISTICS ENDPOINT - No authentication required
app.get('/api/public/stats', async (req, res) => {
  try {
    // Read the stats.json file
    const statsData = await fs.readFile(STATS_FILE_PATH, 'utf-8');
    const stats = JSON.parse(statsData);
    
    res.json({
      success: true,
      timestamp: stats.timestamp || new Date().toISOString(),
      total_users: stats.total_users || 0,
      users_analytics: stats.users_analytics || []
    });
  } catch (error: any) {
    // If file doesn't exist or is empty, return empty stats
    if (error.code === 'ENOENT') {
      return res.json({
        success: true,
        timestamp: new Date().toISOString(),
        total_users: 0,
        users_analytics: [],
        message: 'Statistics file not found - collecting data...'
      });
    }
    
    console.error('Error reading stats file:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to read statistics',
      details: error.message 
    });
  }
});

// Manual trigger for statistics collection (public for now)
app.post('/api/public/stats/collect', async (req, res) => {
  try {
    const success = await triggerStatsSave();
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Statistics collected and saved successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to collect statistics' 
      });
    }
  } catch (error: any) {
    console.error('Error collecting stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Statistics collection failed',
      details: error.message 
    });
  }
});

// Get server health and stats info
app.get('/api/public/server-info', async (req, res) => {
  try {
    let statsInfo = { exists: false, size: 0, lastModified: null };
    
    try {
      const stats = await fs.stat(STATS_FILE_PATH);
      statsInfo = {
        exists: true,
        size: stats.size,
        lastModified: stats.mtime.toISOString()
      };
    } catch (error) {
      // File doesn't exist, that's okay
    }
    
    res.json({
      success: true,
      server_name: 'Inventory Management System',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      statistics: {
        auto_save_interval_hours: AUTO_SAVE_INTERVAL_HOURS,
        stats_file: statsInfo,
        next_auto_save: statsInterval ? 'active' : 'inactive'
      },
      endpoints: {
        public: ['/api/register', '/api/login', '/api/public/stats', '/api/public/stats/collect'],
        protected: ['/api/products', '/api/inventory', '/api/customers', '/api/suppliers', '/api/transactions', '/api/analytics/*']
      }
    });
  } catch (error: any) {
    console.error('Error getting server info:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get server information' 
    });
  }
});

// ============================================
// PROTECTED ENDPOINTS (AUTHENTICATION REQUIRED)
// ============================================

// Product management endpoints
app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const { name, price, nation_of_origin, product_bar_code, expiration_date } = req.body;

    if (!name || !price || !product_bar_code) {
      return res.status(400).json({ success: false, error: 'Missing required fields: name, price, product_bar_code' });
    }

    const productId = await createProduct(req.user!.folder_hash, {
      name,
      price,
      nation_of_origin,
      product_bar_code,
      expiration_date
    });

    res.status(201).json({ success: true, productId });
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const products = await getAllProducts(req.user!.folder_hash);
    res.json({ success: true, products });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/products/barcode/:barcode', authenticateToken, async (req, res) => {
  try {
    const { barcode } = req.params;
    const product = await getProductByBarcode(req.user!.folder_hash, barcode);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error: any) {
    console.error('Error fetching product by barcode:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const updates = req.body;

    if (isNaN(productId)) {
      return res.status(400).json({ success: false, error: 'Invalid product ID' });
    }

    await updateProduct(req.user!.folder_hash, productId, updates);
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({ success: false, error: 'Invalid product ID' });
    }

    await deleteProduct(req.user!.folder_hash, productId);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Inventory management endpoints
app.post('/api/inventory', authenticateToken, async (req, res) => {
  try {
    const { ProductID, purchase_price, sale_price, quantity, expiration_date_per_batch } = req.body;

    if (!ProductID || !purchase_price || !sale_price || !quantity) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: ProductID, purchase_price, sale_price, quantity' 
      });
    }

    const batchId = await addInventoryBatch(req.user!.folder_hash, {
      ProductID,
      purchase_price,
      sale_price,
      quantity,
      expiration_date_per_batch
    });

    res.status(201).json({ success: true, batchId });
  } catch (error: any) {
    console.error('Error adding inventory batch:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/inventory/:id', authenticateToken, async (req, res) => {
  try {
    const batchId = parseInt(req.params.id);
    const updates = req.body;

    if (isNaN(batchId)) {
      return res.status(400).json({ success: false, error: 'Invalid inventory batch ID (OrderID)' });
    }

    await updateInventoryBatch(req.user!.folder_hash, batchId, updates);
    res.json({ success: true, message: 'Inventory batch updated successfully' });
  } catch (error: any) {
    console.error('Error updating inventory batch:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/inventory/:id', authenticateToken, async (req, res) => {
  try {
    const batchId = parseInt(req.params.id);

    if (isNaN(batchId)) {
      return res.status(400).json({ success: false, error: 'Invalid inventory batch ID (OrderID)' });
    }

    await deleteInventoryBatch(req.user!.folder_hash, batchId);
    res.json({ success: true, message: 'Inventory batch deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting inventory batch:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/inventory/stock-level/:productId', authenticateToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    
    if (isNaN(productId)) {
      return res.status(400).json({ success: false, error: 'Invalid product ID' });
    }

    const stockLevel = await getProductStockLevel(req.user!.folder_hash, productId);
    res.json({ success: true, stockLevel });
  } catch (error: any) {
    console.error('Error fetching stock level:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/inventory/reduce', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: productId, quantity' 
      });
    }

    await reduceInventoryFIFO(req.user!.folder_hash, productId, quantity);
    res.json({ success: true, message: 'Inventory reduced successfully' });
  } catch (error: any) {
    console.error('Error reducing inventory:', error);
    const statusCode = error.message === 'Insufficient stock' ? 400 : 500;
    res.status(statusCode).json({ success: false, error: error.message });
  }
});

// Token validation endpoint
app.get('/api/check-token', authenticateToken, async (req, res) => {
  try {
    res.json({ 
      success: true, 
      user: {
        id: req.user!.id,
        email: req.user!.email,
        shop_name: req.user!.shop_name
      },
      message: 'Token is valid'
    });
  } catch (error: any) {
    console.error('Token verification error:', error);
    res.status(500).json({ success: false, error: 'Token verification failed' });
  }
});

// Customer management endpoints
app.post('/api/customers', authenticateToken, async (req, res) => {
  try {
    const { name, phone_number, email } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Missing required field: name' });
    }

    const customerId = await createCustomer(req.user!.folder_hash, {
      name,
      phone_number,
      email
    });

    res.status(201).json({ success: true, customerId });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/customers', authenticateToken, async (req, res) => {
  try {
    const customers = await getCustomers(req.user!.folder_hash);
    res.json({ success: true, customers });
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/customers/:id', authenticateToken, async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    const updates = req.body;

    if (isNaN(customerId)) {
      return res.status(400).json({ success: false, error: 'Invalid customer ID' });
    }

    await updateCustomer(req.user!.folder_hash, customerId, updates);
    res.json({ success: true, message: 'Customer updated successfully' });
  } catch (error: any) {
    console.error('Error updating customer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/customers/:id', authenticateToken, async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);

    if (isNaN(customerId)) {
      return res.status(400).json({ success: false, error: 'Invalid customer ID' });
    }

    await deleteCustomer(req.user!.folder_hash, customerId);
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Supplier management endpoints
app.post('/api/suppliers', authenticateToken, async (req, res) => {
  try {
    const { Name, phone_number, email } = req.body;

    if (!Name) {
      return res.status(400).json({ success: false, error: 'Missing required field: Name' });
    }

    const supplierId = await createSupplier(req.user!.folder_hash, {
      Name,
      phone_number,
      email
    });

    res.status(201).json({ success: true, supplierId });
  } catch (error: any) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/suppliers', authenticateToken, async (req, res) => {
  try {
    const suppliers = await getSuppliers(req.user!.folder_hash);
    res.json({ success: true, suppliers });
  } catch (error: any) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/suppliers/:id', authenticateToken, async (req, res) => {
  try {
    const supplierId = parseInt(req.params.id);
    const updates = req.body;

    if (isNaN(supplierId)) {
      return res.status(400).json({ success: false, error: 'Invalid supplier ID' });
    }

    await updateSupplier(req.user!.folder_hash, supplierId, updates);
    res.json({ success: true, message: 'Supplier updated successfully' });
  } catch (error: any) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/suppliers/:id', authenticateToken, async (req, res) => {
  try {
    const supplierId = parseInt(req.params.id);

    if (isNaN(supplierId)) {
      return res.status(400).json({ success: false, error: 'Invalid supplier ID' });
    }

    await deleteSupplier(req.user!.folder_hash, supplierId);
    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Supplier-Product Linking endpoints
app.post('/api/suppliers/link', authenticateToken, async (req, res) => {
  try {
    const { 
      supplier_id, 
      product_id, 
      supplier_price, 
      supplier_sku, 
      min_order_quantity, 
      lead_time_days, 
      is_active 
    } = req.body;

    if (!supplier_id || !product_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: supplier_id, product_id' 
      });
    }

    // Validate supplier price
    if (supplier_price === undefined || supplier_price === null) {
      return res.status(400).json({ 
        success: false, 
        error: 'Supplier price is required' 
      });
    }

    if (Number(supplier_price) < 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Supplier price cannot be negative' 
      });
    }

    // Construct the pricing object expected by database_ops
    const pricingData = {
      supplier_price: Number(supplier_price),
      supplier_sku,
      min_order_quantity: min_order_quantity ? Number(min_order_quantity) : undefined,
      lead_time_days: lead_time_days ? Number(lead_time_days) : undefined,
      is_active
    };

    await linkSupplierToProduct(req.user!.folder_hash, supplier_id, product_id, pricingData);
    
    res.json({ success: true, message: 'Supplier linked to product successfully' });
  } catch (error: any) {
    console.error('Error linking supplier to product:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to link supplier to product' 
    });
  }
});

app.delete('/api/suppliers/:supplierId/products/:productId', authenticateToken, async (req, res) => {
  try {
    const supplierId = parseInt(req.params.supplierId);
    const productId = parseInt(req.params.productId);

    if (isNaN(supplierId) || isNaN(productId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid supplier ID or product ID' 
      });
    }

    await unlinkSupplierFromProduct(req.user!.folder_hash, supplierId, productId);
    
    res.json({ 
      success: true, 
      message: 'Supplier unlinked from product successfully' 
    });
  } catch (error: any) {
    console.error('Error unlinking supplier from product:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to unlink supplier from product' 
    });
  }
});

// Transaction management endpoints
app.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { TransactionType, payment_type, amount, SupplierID, CustomerID, TransactionDate } = req.body;

    if (!TransactionType || !payment_type || !amount || !TransactionDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: TransactionType, payment_type, amount, TransactionDate' 
      });
    }

    const transactionId = await createTransaction(req.user!.folder_hash, {
      TransactionType,
      payment_type,
      amount,
      SupplierID,
      CustomerID,
      TransactionDate
    });

    res.status(201).json({ success: true, transactionId });
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { type } = req.query;
    const transactionType = type as 'Purchase' | 'Sale' | undefined;
    
    const transactions = await getTransactionHistory(req.user!.folder_hash, transactionType);
    res.json({ success: true, transactions });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);
    const updates = req.body;

    if (isNaN(transactionId)) {
      return res.status(400).json({ success: false, error: 'Invalid transaction ID' });
    }

    await updateTransaction(req.user!.folder_hash, transactionId, updates);
    res.json({ success: true, message: 'Transaction updated successfully' });
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);

    if (isNaN(transactionId)) {
      return res.status(400).json({ success: false, error: 'Invalid transaction ID' });
    }

    await deleteTransaction(req.user!.folder_hash, transactionId);
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Supplier-Product Relationship endpoints
app.get('/api/suppliers/:id/products', authenticateToken, async (req, res) => {
  try {
    const supplierId = parseInt(req.params.id);
    
    if (isNaN(supplierId)) {
      return res.status(400).json({ success: false, error: 'Invalid supplier ID' });
    }

    const products = await getProductsBySupplier(req.user!.folder_hash, supplierId);
    res.json({ success: true, products });
  } catch (error: any) {
    console.error('Error fetching supplier products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/products/:id/suppliers', authenticateToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ success: false, error: 'Invalid product ID' });
    }

    const suppliers = await getSuppliersByProduct(req.user!.folder_hash, productId);
    res.json({ success: true, suppliers });
  } catch (error: any) {
    console.error('Error fetching product suppliers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/suppliers-links', authenticateToken, async (req, res) => {
  try {
    const links = await getAllSupplierProductLinks(req.user!.folder_hash);
    res.json({ success: true, links });
  } catch (error: any) {
    console.error('Error fetching supplier product links:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/suppliers/:supplierId/products/:productId/pricing', authenticateToken, async (req, res) => {
  try {
    const supplierId = parseInt(req.params.supplierId);
    const productId = parseInt(req.params.productId);
    const pricing = req.body;

    if (isNaN(supplierId) || isNaN(productId)) {
      return res.status(400).json({ success: false, error: 'Invalid supplier ID or product ID' });
    }

    if (!pricing.supplier_price) {
      return res.status(400).json({ success: false, error: 'Supplier price is required' });
    }

    await updateSupplierProductPricing(req.user!.folder_hash, supplierId, productId, pricing);
    res.json({ success: true, message: 'Supplier pricing updated successfully' });
  } catch (error: any) {
    console.error('Error updating supplier pricing:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Product-Inventory endpoints
app.get('/api/products/:id/inventory', authenticateToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ success: false, error: 'Invalid product ID' });
    }

    const inventory = await getInventoryByProduct(req.user!.folder_hash, productId);
    res.json({ success: true, inventory });
  } catch (error: any) {
    console.error('Error fetching product inventory:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Customer-Transaction endpoints
app.get('/api/customers/:id/transactions', authenticateToken, async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    
    if (isNaN(customerId)) {
      return res.status(400).json({ success: false, error: 'Invalid customer ID' });
    }

    const transactions = await getTransactionsByCustomer(req.user!.folder_hash, customerId);
    res.json({ success: true, transactions });
  } catch (error: any) {
    console.error('Error fetching customer transactions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Supplier-Transaction endpoints
app.get('/api/suppliers/:id/transactions', authenticateToken, async (req, res) => {
  try {
    const supplierId = parseInt(req.params.id);
    
    if (isNaN(supplierId)) {
      return res.status(400).json({ success: false, error: 'Invalid supplier ID' });
    }

    const transactions = await getTransactionsBySupplier(req.user!.folder_hash, supplierId);
    res.json({ success: true, transactions });
  } catch (error: any) {
    console.error('Error fetching supplier transactions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// PROTECTED ANALYTICS ENDPOINTS
// ============================================

// Basic Analytics endpoints
app.get('/api/analytics/low-stock', authenticateToken, async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 10;
    
    const lowStockAlerts = await getLowStockAlerts(req.user!.folder_hash, threshold);
    res.json({ success: true, lowStockAlerts });
  } catch (error: any) {
    console.error('Error fetching low stock alerts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/analytics/daily-sales', authenticateToken, async (req, res) => {
  try {
    const date = req.query.date as string || new Date().toISOString().split('T')[0];
    
    const dailySales = await getDailySalesTotal(req.user!.folder_hash, date);
    res.json({ success: true, dailySales });
  } catch (error: any) {
    console.error('Error fetching daily sales:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Advanced Analytics endpoints
app.get('/api/analytics/sales-trends', authenticateToken, async (req, res) => {
  try {
    const { 
      period = 'monthly', 
      startDate, 
      endDate 
    } = req.query;
    
    const defaultEndDate = new Date().toISOString().split('T')[0];
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 12);
    
    const trends = await getSalesTrends(
      req.user!.folder_hash,
      period as 'daily' | 'weekly' | 'monthly',
      startDate as string || defaultStartDate.toISOString().split('T')[0],
      endDate as string || defaultEndDate
    );
    
    res.json({ success: true, trends });
  } catch (error: any) {
    console.error('Error fetching sales trends:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/analytics/top-products', authenticateToken, async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    
    const topProducts = await getTopProducts(
      req.user!.folder_hash,
      parseInt(limit as string),
      startDate as string,
      endDate as string
    );
    
    res.json({ success: true, topProducts });
  } catch (error: any) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/analytics/inventory-turnover', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.query;
    
    const turnover = await getInventoryTurnover(
      req.user!.folder_hash,
      productId ? parseInt(productId as string) : undefined
    );
    
    res.json({ success: true, turnover });
  } catch (error: any) {
    console.error('Error fetching inventory turnover:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/analytics/profit-margin', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const defaultEndDate = new Date().toISOString().split('T')[0];
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);
    
    const profitMargin = await getProfitMargin(
      req.user!.folder_hash,
      startDate as string || defaultStartDate.toISOString().split('T')[0],
      endDate as string || defaultEndDate
    );
    
    res.json({ success: true, profitMargin });
  } catch (error: any) {
    console.error('Error fetching profit margin:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/analytics/customer-lifetime-value', authenticateToken, async (req, res) => {
  try {
    const customerLifetime = await getCustomerLifetimeValue(req.user!.folder_hash);
    
    res.json({ success: true, customerLifetime });
  } catch (error: any) {
    console.error('Error fetching customer lifetime value:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/analytics/supplier-performance', authenticateToken, async (req, res) => {
  try {
    const supplierPerformance = await getSupplierPerformance(req.user!.folder_hash);
    
    res.json({ success: true, supplierPerformance });
  } catch (error: any) {
    console.error('Error fetching supplier performance:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/analytics/inventory-valuation', authenticateToken, async (req, res) => {
  try {
    const inventoryValuation = await getInventoryValuation(req.user!.folder_hash);
    
    res.json({ success: true, inventoryValuation });
  } catch (error: any) {
    console.error('Error fetching inventory valuation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/analytics/payment-analysis', authenticateToken, async (req, res) => {
  try {
    const paymentAnalysis = await getPaymentAnalysis(req.user!.folder_hash);
    
    res.json({ success: true, paymentAnalysis });
  } catch (error: any) {
    console.error('Error fetching payment analysis:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/analytics/complete', authenticateToken, async (req, res) => {
  try {
    const completeAnalytics = await getUserAnalytics(
      req.user!.folder_hash,
      req.user!.id,
      req.user!.shop_name
    );
    
    res.json({ success: true, analytics: completeAnalytics });
  } catch (error: any) {
    console.error('Error fetching complete analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Quick stats dashboard endpoint
app.get('/api/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const [
      lowStockAlerts,
      dailySales,
      paymentAnalysis,
      inventoryValuation
    ] = await Promise.all([
      getLowStockAlerts(req.user!.folder_hash, 10),
      getDailySalesTotal(req.user!.folder_hash, new Date().toISOString().split('T')[0]),
      getPaymentAnalysis(req.user!.folder_hash),
      getInventoryValuation(req.user!.folder_hash)
    ]);
    
    const totalInventoryValue = inventoryValuation.reduce((sum, item) => sum + item.current_value, 0);
    
    res.json({
      success: true,
      dashboard: {
        total_inventory_value: totalInventoryValue,
        today_sales: dailySales,
        low_stock_count: lowStockAlerts.length,
        outstanding_balance: paymentAnalysis.outstanding_balance,
        low_stock_alerts: lowStockAlerts.slice(0, 5) // Top 5 low stock items
      }
    });
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin endpoints for statistics management (protected)
app.post('/api/admin/save-stats', authenticateToken, async (req, res) => {
  try {
    const success = await triggerStatsSave();
    
    if (success) {
      res.json({ success: true, message: 'Statistics saved successfully' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to save statistics' });
    }
  } catch (error: any) {
    console.error('Error triggering stats save:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/stop-stats-collection', authenticateToken, async (req, res) => {
  try {
    stopStatsCollection();
    res.json({ success: true, message: 'Statistics collection stopped' });
  } catch (error: any) {
    console.error('Error stopping stats collection:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/start-stats-collection', authenticateToken, async (req, res) => {
  try {
    const { intervalHours = 6 } = req.body;
    startStatsCollection(intervalHours);
    res.json({ 
      success: true, 
      message: `Statistics collection started (every ${intervalHours} hours)` 
    });
  } catch (error: any) {
    console.error('Error starting stats collection:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// GLOBAL ERROR HANDLER & SERVER START
// ============================================

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    requested_url: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: error.message || 'Unknown error occurred'
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  stopStatsCollection();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Terminating server...');
  stopStatsCollection();
  process.exit(0);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Public stats endpoint: http://localhost:${port}/api/public/stats`);
  console.log(`Auto-saving stats every ${AUTO_SAVE_INTERVAL_HOURS} hours`);
});

export default app;