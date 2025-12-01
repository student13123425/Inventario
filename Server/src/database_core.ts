import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'users.db');
export const dataPath = join(__dirname, '../data');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database at', dbPath);
  }
});

export function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shop_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        folder_hash TEXT UNIQUE NOT NULL
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
        reject(err);
      } else {
        console.log('Users table ready.');
        resolve();
      }
    });
  });
}

export interface User {
  id: number;
  shop_name: string;
  email: string;
  password_hash: string;
  folder_hash: string;
}

export interface Product {
  ID?: number;
  name: string;
  price: number;
  nation_of_origin?: string;
  product_bar_code: string;
  expiration_date?: number;
}

export interface InventoryBatch {
  OrderID?: number;
  ProductID: number;
  purchase_price: number;
  sale_price: number;
  quantity: number;
  expiration_date_per_batch?: string;
}

export interface Customer {
  ID?: number;
  name: string;
  phone_number?: string;
  email?: string;
}

export interface Supplier {
  ID?: number;
  Name: string;
  phone_number?: string;
  email?: string;
}

export interface TransactionRecord {
  ID?: number;
  TransactionType: 'Purchase' | 'Sale';
  payment_type: 'paid' | 'owed';
  amount: number;
  SupplierID?: number;
  CustomerID?: number;
  TransactionDate: string;
  notes?: string;
}

export function getUserByEmail(email: string): Promise<User | undefined> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) reject(err);
      else resolve(row as User | undefined);
    });
  });
}

export function getUserById(id: number): Promise<User | undefined> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row as User | undefined);
    });
  });
}

// NEW: Get all users for statistics collection
export function getAllUsers(): Promise<User[]> {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, shop_name, email, folder_hash FROM users', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows as User[]);
    });
  });
}

export async function createUser(
  shopName: string,
  email: string,
  passwordHash: string,
  folderHash: string
): Promise<number> {
  const userFolderPath = join(dataPath, folderHash);

  try {
    await mkdir(userFolderPath, { recursive: true });
    await mkdir(`${userFolderPath}/images`, { recursive: true });
    
    init_user_data(`${userFolderPath}/user.db`);

    return await new Promise<number>((resolve, reject) => {
      db.run(
        'INSERT INTO users (shop_name, email, password_hash, folder_hash) VALUES (?, ?, ?, ?)',
        [shopName, email, passwordHash, folderHash],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  } catch (err) {
    throw err;
  }
}

// Updated init_user_data function with default customer creation
export function init_user_data(path: string) {
    const db = new sqlite3.Database(path);

    db.serialize(() => {
        db.run("PRAGMA foreign_keys = ON;");
        
        // Create suppliers table FIRST (referenced by multiple tables)
        db.run(`
            CREATE TABLE IF NOT EXISTS suppliers (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                Name TEXT NOT NULL,
                phone_number TEXT,
                email TEXT
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS products (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                nation_of_origin TEXT,
                product_bar_code TEXT UNIQUE,
                expiration_date INTEGER
            )
        `);

        // Create customers table
        db.run(`
            CREATE TABLE IF NOT EXISTS customers (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone_number TEXT,
                email TEXT
            )
        `);

        // Create supplier_products table (junction table)
        db.run(`
            CREATE TABLE IF NOT EXISTS supplier_products (
                SupplierID INTEGER NOT NULL,
                ProductID INTEGER NOT NULL,
                PRIMARY KEY (SupplierID, ProductID),
                FOREIGN KEY (SupplierID) REFERENCES suppliers(ID) ON DELETE CASCADE,
                FOREIGN KEY (ProductID) REFERENCES products(ID) ON DELETE CASCADE
            )
        `);

        // Create supplier_product_pricing table AFTER supplier_products
        db.run(`
            CREATE TABLE IF NOT EXISTS supplier_product_pricing (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                SupplierID INTEGER NOT NULL,
                ProductID INTEGER NOT NULL,
                supplier_price REAL NOT NULL DEFAULT 0,
                supplier_sku TEXT,
                min_order_quantity INTEGER DEFAULT 1,
                lead_time_days INTEGER DEFAULT 7,
                is_active BOOLEAN DEFAULT 1,
                last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (SupplierID) REFERENCES suppliers(ID) ON DELETE CASCADE,
                FOREIGN KEY (ProductID) REFERENCES products(ID) ON DELETE CASCADE,
                FOREIGN KEY (SupplierID, ProductID) REFERENCES supplier_products(SupplierID, ProductID) ON DELETE CASCADE,
                UNIQUE(SupplierID, ProductID)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS inventory (
                OrderID INTEGER PRIMARY KEY AUTOINCREMENT,
                ProductID INTEGER NOT NULL,
                purchase_price REAL NOT NULL,
                sale_price REAL NOT NULL,
                quantity INTEGER NOT NULL,
                expiration_date_per_batch TEXT,
                FOREIGN KEY (ProductID) REFERENCES products(ID) ON DELETE CASCADE
            )
        `);

        // UPDATED: Transactions table with notes column and updated TransactionType check
        db.run(`
            CREATE TABLE IF NOT EXISTS Transactions (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                TransactionType TEXT NOT NULL CHECK (TransactionType IN ('Purchase', 'Sale', 'Deposit', 'Withdrawal')),
                payment_type TEXT NOT NULL CHECK (payment_type IN ('paid', 'owed')),
                amount REAL NOT NULL,
                SupplierID INTEGER,
                CustomerID INTEGER,
                TransactionDate TEXT NOT NULL,
                notes TEXT,
                FOREIGN KEY (SupplierID) REFERENCES suppliers(ID),
                FOREIGN KEY (CustomerID) REFERENCES customers(ID)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS StockMovement (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                movement_type TEXT NOT NULL CHECK (movement_type IN ('In', 'Out')),
                Quantity INTEGER NOT NULL,
                MovementDate TEXT NOT NULL,
                InventoryID INTEGER NOT NULL,
                FOREIGN KEY (InventoryID) REFERENCES inventory(OrderID)
            )
        `);

        // CRITICAL FIX: Create a default "Public/Client" customer for sales transactions
        db.run(`
            INSERT OR IGNORE INTO customers (ID, name, email, phone_number)
            VALUES (1, 'Public/Client', 'public@client.com', 'N/A')
        `, (err) => {
            if (err) {
                console.warn('Error creating default customer (might already exist):', err.message);
            } else {
                console.log('Default customer (Public/Client) created or already exists');
            }
        });

        // Try to add notes column to existing Transactions tables
        db.run("ALTER TABLE Transactions ADD COLUMN notes TEXT;", (err) => {
            if (err && !err.message.includes("duplicate column name")) {
                console.warn("Could not add notes column (might already exist):", err.message);
            }
        });
    });

    db.close();
}

export function connectToUserDatabase(folderHash: string): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    const userDbPath = join(dataPath, folderHash, 'user.db');
    const userDb = new sqlite3.Database(userDbPath, (err) => {
      if (err) reject(err);
      else {
        userDb.run("PRAGMA foreign_keys = ON;");
        
        // Verify default customer exists when connecting
        userDb.get("SELECT 1 FROM customers WHERE ID = 1", (err, row) => {
          if (err) {
            console.warn('Error checking default customer:', err.message);
          } else if (!row) {
            // Create default customer if it doesn't exist
            userDb.run(`
              INSERT OR IGNORE INTO customers (ID, name, email, phone_number)
              VALUES (1, 'Public/Client', 'public@client.com', 'N/A')
            `, (insertErr) => {
              if (insertErr) {
                console.warn('Error creating default customer on connection:', insertErr.message);
              }
            });
          }
        });
        
        resolve(userDb);
      }
    });
  });
}