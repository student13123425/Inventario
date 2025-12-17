import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ADMIN_FILE_PATH = path.join(__dirname, '../admin.json');
const ADMIN_JWT_SECRET = 'admin_secret_key_distinct_from_user_secret_8473'; // Unique secret for admin
const SALT_ROUNDS = 12;
// Initialize admin.json with default credentials if it doesn't exist
export async function initializeAdmin() {
    try {
        await fs.access(ADMIN_FILE_PATH);
        // File exists, verify structure or do nothing
    }
    catch {
        console.log('Admin config not found. Creating default admin.json...');
        // Default: Admin / 123
        const defaultPassword = '123';
        const passwordHash = await bcrypt.hash(defaultPassword, SALT_ROUNDS);
        const defaultConfig = {
            username: 'Admin',
            password_hash: passwordHash
        };
        await fs.writeFile(ADMIN_FILE_PATH, JSON.stringify(defaultConfig, null, 2));
        console.log('Default Admin credentials created. Username: "Admin", Password: "123"');
    }
}
// Generate Admin Token
export function generateAdminToken(username) {
    return jwt.sign({ username, role: 'admin' }, ADMIN_JWT_SECRET, { expiresIn: '4h' });
}
// Admin Login Logic
export async function loginAdmin(username, password) {
    try {
        const data = await fs.readFile(ADMIN_FILE_PATH, 'utf-8');
        const config = JSON.parse(data);
        // Simple username check (case-sensitive usually, but could be normalized)
        if (username !== config.username) {
            return { success: false, error: 'Invalid credentials' };
        }
        const match = await bcrypt.compare(password, config.password_hash);
        if (!match) {
            return { success: false, error: 'Invalid credentials' };
        }
        const token = generateAdminToken(username);
        return { success: true, token };
    }
    catch (error) {
        console.error('Admin login error:', error);
        return { success: false, error: 'Internal server error' };
    }
}
// Change Admin Credentials
export async function changeAdminCredentials(currentUsername, currentPassword, newUsername, newPassword) {
    try {
        // 1. Read existing config
        const data = await fs.readFile(ADMIN_FILE_PATH, 'utf-8');
        const config = JSON.parse(data);
        // 2. Verify current credentials
        if (currentUsername !== config.username) {
            return { success: false, error: 'Current username incorrect' };
        }
        const match = await bcrypt.compare(currentPassword, config.password_hash);
        if (!match) {
            return { success: false, error: 'Current password incorrect' };
        }
        // 3. Hash new password
        const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        // 4. Save new config
        const newConfig = {
            username: newUsername,
            password_hash: newHash
        };
        await fs.writeFile(ADMIN_FILE_PATH, JSON.stringify(newConfig, null, 2));
        console.log(`Admin credentials updated. New username: ${newUsername}`);
        return { success: true };
    }
    catch (error) {
        console.error('Change admin creds error:', error);
        return { success: false, error: 'Failed to update credentials' };
    }
}
// Middleware to protect routes
export function authenticateAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, error: 'Admin token required' });
    }
    jwt.verify(token, ADMIN_JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, error: 'Invalid or expired admin token' });
        }
        // Ensure the token role is admin
        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Insufficient permissions' });
        }
        req.admin = decoded;
        next();
    });
}
//# sourceMappingURL=admin_auth.js.map