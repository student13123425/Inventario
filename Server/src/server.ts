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
  updateSupplierProductPricing
} from './database_ops.js';

const app = express();
const port = 3000;

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

initializeDatabase().catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Public routes (no authentication required)
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

// Protected routes (authentication required)
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
    // SQLite might throw foreign key constraint errors
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

// In server.ts, replace the link endpoint:

app.post('/api/suppliers/link', authenticateToken, async (req, res) => {
  try {
    const { supplierId, productId, initialPricing } = req.body;

    if (!supplierId || !productId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: supplierId, productId' 
      });
    }

    // Pass initial pricing data if provided
    await linkSupplierToProduct(req.user!.folder_hash, supplierId, productId, initialPricing);
    
    res.json({ success: true, message: 'Supplier linked to product successfully' });
  } catch (error: any) {
    console.error('Error linking supplier to product:', error);
    res.status(500).json({ success: false, error: error.message });
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

// Analytics endpoints
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

// Global error handler (must be last)
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
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

export default app;