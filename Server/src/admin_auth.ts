import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_FILE_PATH = path.join(__dirname, '../admin.json');
const ADMIN_JWT_SECRET = 'admin_secret_key_distinct_from_user_secret_8473'; 
const SALT_ROUNDS = 10;

interface AdminConfig {
    username: string;
    password_hash: string;
}

export async function initializeAdmin() {
    try {
        await fs.access(ADMIN_FILE_PATH);
    } catch {
        console.log('Admin config not found. Creating default admin.json...');
        const defaultPassword = '123';
        const passwordHash = await bcrypt.hash(defaultPassword, SALT_ROUNDS);
        
        const defaultConfig: AdminConfig = {
            username: 'Admin',
            password_hash: passwordHash
        };

        await fs.writeFile(ADMIN_FILE_PATH, JSON.stringify(defaultConfig, null, 2));
        console.log('Default Admin credentials created. Username: "Admin", Password: "123"');
    }
}

export function generateAdminToken(username: string): string {
    return jwt.sign({ username, role: 'admin' }, ADMIN_JWT_SECRET, { expiresIn: '4h' });
}

export async function loginAdmin(username: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
        const data = await fs.readFile(ADMIN_FILE_PATH, 'utf-8');
        const config: AdminConfig = JSON.parse(data);

        if (username !== config.username) {
            return { success: false, error: 'Invalid credentials' };
        }

        const match = await bcrypt.compare(password, config.password_hash);
        if (!match) {
            return { success: false, error: 'Invalid credentials' };
        }

        const token = generateAdminToken(username);
        return { success: true, token };
    } catch (error) {
        console.error('Admin login error:', error);
        return { success: false, error: 'Internal server error' };
    }
}

export async function changeAdminCredentials(
    currentUsername: string, 
    currentPassword: string, 
    newUsername: string, 
    newPassword: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const data = await fs.readFile(ADMIN_FILE_PATH, 'utf-8');
        const config: AdminConfig = JSON.parse(data);

        if (currentUsername !== config.username) {
            return { success: false, error: 'Current username incorrect' };
        }

        const match = await bcrypt.compare(currentPassword, config.password_hash);
        if (!match) {
            return { success: false, error: 'Current password incorrect' };
        }

        const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        
        const newConfig: AdminConfig = {
            username: newUsername,
            password_hash: newHash
        };

        await fs.writeFile(ADMIN_FILE_PATH, JSON.stringify(newConfig, null, 2));
        console.log(`Admin credentials updated. New username: ${newUsername}`);
        
        return { success: true };

    } catch (error) {
        console.error('Change admin creds error:', error);
        return { success: false, error: 'Failed to update credentials' };
    }
}

export function authenticateAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'Admin token required' });
    }

    jwt.verify(token, ADMIN_JWT_SECRET, (err: any, decoded: any) => {
        if (err) {
            return res.status(403).json({ success: false, error: 'Invalid or expired admin token' });
        }
        
        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Insufficient permissions' });
        }

        (req as any).admin = decoded;
        next();
    });
}