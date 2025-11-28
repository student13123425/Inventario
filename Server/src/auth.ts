import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getUserByEmail, createUser } from './database_core.js';
import express from 'express';
const jwtSecret = 'your_jwt_secret_key_here_change_in_production';
const saltRounds = 12;

export function generateToken(userId: number, email: string): string {
  return jwt.sign({ id: userId, email }, jwtSecret, { expiresIn: '1h' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
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
      return { valid: false, error: 'Invalid or expired token' };
    }

    const { getUserById } = await import('./database_core.js');

    const user = await getUserById(decoded.id);
    if (!user) {
      return { valid: false, error: 'User no longer exists' };
    }

    return { valid: true, user };
  } catch (error) {
    console.error('Token verification error:', error);
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
      return { success: false, error: 'Email already registered' };
    }
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const folderHash = uuidv4();
    const userId = await createUser(shopName, email, passwordHash, folderHash);
    const token = generateToken(userId, email);
    return { success: true, token };
  } catch (error) {
    console.error('Registration error:', error);
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
      return { success: false, error: 'Invalid credentials' };
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return { success: false, error: 'Invalid credentials' };
    }
    const token = generateToken(user.id, user.email);
    return { success: true, token };
  } catch (error) {
    console.error('Login error:', error);
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
      return res.status(401).json({ success: false, error: 'Access token required' });
    }

    const { verifyTokenOwnership } = await import('./auth.js');

    const result = await verifyTokenOwnership(token);

    if (!result.valid || !result.user) {
      return res.status(401).json({ success: false, error: result.error || 'Invalid token' });
    }

    req.user = {
      id: result.user.id,
      email: result.user.email,
      shop_name: result.user.shop_name
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ success: false, error: 'Authentication failed' });
  }
}

export function getAuthenticatedUser(req: express.Request): { id: number; email: string; shop_name: string } {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  return req.user;
}
