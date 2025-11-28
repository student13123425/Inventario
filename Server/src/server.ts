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
  addInventoryBatch,
  getProductStockLevel,
  reduceInventoryFIFO,
  createCustomer,
  getCustomers,
  createSupplier,
  getSuppliers,
  linkSupplierToProduct,
  createTransaction,
  getTransactionHistory,
  getLowStockAlerts,
  getDailySalesTotal
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

app.post('/api/suppliers/link', authenticateToken, async (req, res) => {
  try {
    const { supplierId, productId } = req.body;

    if (!supplierId || !productId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: supplierId, productId' 
      });
    }

    await linkSupplierToProduct(req.user!.folder_hash, supplierId, productId);
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

export default app;