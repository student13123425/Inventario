import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getUserByEmail, createUser } from './database_core.js';
import express from 'express';

const IsDebug = false;
const jwtSecret = 'your_jwt_secret_key_here_change_in_production';
const saltRounds = 12;

export function generateToken(userId: number, email: string): string {
  return jwt.sign({ id: userId, email }, jwtSecret, { expiresIn: '90d' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    if (IsDebug) {
      console.log('Token verification failed:', error);
    }
    return null;
  }
}

export async function verifyTokenOwnership(token: string): Promise<{ 
  valid: boolean; 
  user?: any; 
  error?: string 
}> {
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      if (IsDebug) {
        console.log('Token is invalid or expired');
      }
      return { valid: false, error: 'Invalid or expired token' };
    }

    if (IsDebug) {
      console.log(`Token decoded for user - ID: ${decoded.id}, Email: ${decoded.email}`);
    }

    const { getUserById } = await import('./database_core.js');

    const user = await getUserById(decoded.id);
    if (!user) {
      if (IsDebug) {
        console.log(`User with ID ${decoded.id} no longer exists in database`);
      }
      return { valid: false, error: 'User no longer exists' };
    }

    if (IsDebug) {
      console.log(`User found - ID: ${user.id}, Email: ${user.email}, Shop: ${user.shop_name}`);
    }

    if (!user.folder_hash) {
      if (IsDebug) {
        console.log(`User ${user.email} missing folder_hash`);
      }
      return { valid: false, error: 'User data incomplete' };
    }

    if (IsDebug) {
      console.log(`Token ownership verified successfully for user: ${user.email}`);
    }
    
    return { valid: true, user };
  } catch (error) {
    if (IsDebug) {
      console.error('Token verification error:', error);
    }
    return { valid: false, error: 'Token verification failed' };
  }
}

export async function registerUser(
  shopName: string,
  email: string,
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      if (IsDebug) {
        console.log(`Registration failed - Email already registered: ${email}`);
      }
      return { success: false, error: 'Email already registered' };
    }
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const folderHash = uuidv4();
    const userId = await createUser(shopName, email, passwordHash, folderHash);
    const token = generateToken(userId, email);
    
    if (IsDebug) {
      console.log(`User registered successfully - ID: ${userId}, Email: ${email}, Shop: ${shopName}`);
    }
    
    return { success: true, token };
  } catch (error) {
    if (IsDebug) {
      console.error('Registration error:', error);
    }
    return { success: false, error: 'Internal server error' };
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const user = await getUserByEmail(email);

    if (!user) {
      if (IsDebug) {
        console.log(`Login failed - User not found: ${email}`);
      }
      return { success: false, error: 'Invalid credentials' };
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      if (IsDebug) {
        console.log(`Login failed - Invalid password for user: ${email}`);
      }
      return { success: false, error: 'Invalid credentials' };
    }
    
    const token = generateToken(user.id, user.email);
    
    if (IsDebug) {
      console.log(`Login successful - User: ${user.email}, ID: ${user.id}`);
    }
    
    return { success: true, token };
  } catch (error) {
    if (IsDebug) {
      console.error('Login error:', error);
    }
    return { success: false, error: 'Internal server error' };
  }
}

export function requireResourceOwnership(paramName = 'userId') {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const resourceUserId = parseInt(req.params[paramName]);

    if (req.user.id !== resourceUserId) {
      if (IsDebug) {
        console.log(`Resource ownership check failed - User ${req.user.id} cannot access resource for user ${resourceUserId}`);
      }
      return res.status(403).json({ success: false, error: 'Access denied to this resource' });
    }

    next();
  };
}

export async function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      if (IsDebug) {
        console.log('Authentication failed - No token provided in Authorization header');
      }
      return res.status(401).json({ success: false, error: 'Access token required' });
    }

    if (IsDebug) {
      console.log(`Authenticating token for request to: ${req.method} ${req.path}`);
    }

    const result = await verifyTokenOwnership(token);

    if (!result.valid || !result.user) {
      if (IsDebug) {
        console.log(`Authentication failed - ${result.error || 'Invalid token'}`);
      }
      return res.status(401).json({ success: false, error: result.error || 'Invalid token' });
    }

    req.user = {
      id: result.user.id,
      email: result.user.email,
      shop_name: result.user.shop_name,
      folder_hash: result.user.folder_hash
    };

    if (IsDebug) {
      console.log(`Authentication successful - User: ${req.user.email}, ID: ${req.user.id}`);
    }

    next();
  } catch (error) {
    if (IsDebug) {
      console.error('Authentication error:', error);
    }
    return res.status(500).json({ success: false, error: 'Authentication failed' });
  }
}

export function getAuthenticatedUser(req: express.Request): { 
  id: number; 
  email: string; 
  shop_name: string;
  folder_hash: string;
} {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  return req.user;
}