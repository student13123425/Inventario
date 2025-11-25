import express from 'express';
import bodyParser from 'body-parser';
import { initializeDatabase } from './database.js';
import { registerUser, loginUser } from './auth.js';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        shop_name: string;
      };
    }
  }
}

initializeDatabase().catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Authentication Middleware
async function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ success: false, error: 'Access token required' });
    }

    // Import the token verification function
    const { verifyTokenOwnership } = await import('./auth.js');

    // Verify token and get user
    const result = await verifyTokenOwnership(token);

    if (!result.valid || !result.user) {
      return res.status(401).json({ success: false, error: result.error || 'Invalid token' });
    }

    // Attach user to request for use in route handlers
    req.user = {
      id: result.user.id,
      email: result.user.email,
      shop_name: result.user.shop_name
    };

    next(); // Proceed to the protected route
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ success: false, error: 'Authentication failed' });
  }
}

// Middleware to verify user owns the resource they're accessing
function requireResourceOwnership(paramName = 'userId') {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Check if user is defined (should always be true if authenticateToken ran first)
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const resourceUserId = parseInt(req.params[paramName]);

    if (req.user.id !== resourceUserId) {
      return res.status(403).json({ success: false, error: 'Access denied to this resource' });
    }

    next();
  };
}

// Helper function to get authenticated user with type safety
function getAuthenticatedUser(req: express.Request): { id: number; email: string; shop_name: string } {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  return req.user;
}

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
app.get('/api/private_route', authenticateToken, async (req, res) => {
  try {
    // Use helper function to safely get user
    const user = getAuthenticatedUser(req);

    res.json({
      success: true,
      message: 'This is a protected route',
      user: {
        id: user.id,
        email: user.email,
        shop_name: user.shop_name
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Example user profile route
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    // Use helper function to safely get user
    const user = getAuthenticatedUser(req);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        shop_name: user.shop_name
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user profile' });
  }
});

// Example user-specific resource with ownership check
app.get('/api/users/:userId/orders', authenticateToken, requireResourceOwnership('userId'), async (req, res) => {
  try {
    // Use helper function to safely get user
    const user = getAuthenticatedUser(req);

    // This user is guaranteed to own this resource
    // const orders = await getOrdersByUserId(user.id);

    res.json({
      success: true,
      message: `Orders for user ${user.id}`,
      // orders: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// Example product management route
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    // Use helper function to safely get user
    const user = getAuthenticatedUser(req);

    // const products = await getUserProducts(user.id);

    res.json({
      success: true,
      message: `Products for user ${user.id}`,
      // products: products
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

// Example route with specific product ownership check
app.get('/api/products/:productId', authenticateToken, async (req, res) => {
  try {
    // Use helper function to safely get user
    const user = getAuthenticatedUser(req);

    // const product = await getProductById(req.params.productId);

    // Simulate ownership check
    // if (!product || product.user_id !== user.id) {
    //   return res.status(404).json({ success: false, error: 'Product not found' });
    // }

    res.json({
      success: true,
      message: `Product ${req.params.productId} details for user ${user.id}`,
      // product: product
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Example update user profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    // Use helper function to safely get user
    const user = getAuthenticatedUser(req);

    const { shop_name, email } = req.body;

    // Update user logic here
    // await updateUserProfile(user.id, { shop_name, email });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: email || user.email,
        shop_name: shop_name || user.shop_name
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// Example delete user account
app.delete('/api/user', authenticateToken, async (req, res) => {
  try {
    // Use helper function to safely get user
    const user = getAuthenticatedUser(req);

    // Delete user logic here
    // await deleteUserAccount(user.id);

    res.json({
      success: true,
      message: 'User account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete account' });
  }
});

// 404 handler for undefined routes (must be after all other routes)
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
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