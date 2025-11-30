import sqlite3 from 'sqlite3';
import { 
    connectToUserDatabase, 
    Product, 
    InventoryBatch, 
    Customer, 
    Supplier, 
    TransactionRecord 
} from './database_core.js';


export async function createProduct(folderHash: string, product: Product): Promise<number> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO products (name, price, nation_of_origin, product_bar_code, expiration_date) VALUES (?, ?, ?, ?, ?)`,
      [product.name, product.price, product.nation_of_origin, product.product_bar_code, product.expiration_date],
      function (err) {
        db.close();
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

export async function getProductByBarcode(folderHash: string, barcode: string): Promise<Product | undefined> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM products WHERE product_bar_code = ?', [barcode], (err, row) => {
      db.close();
      if (err) reject(err);
      else resolve(row as Product | undefined);
    });
  });
}

export async function getAllProducts(folderHash: string): Promise<Product[]> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows as Product[]);
    });
  });
}

export async function updateProduct(folderHash: string, id: number, product: Partial<Product>): Promise<void> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    // Filter out undefined values
    const keys = Object.keys(product).filter(k => product[k as keyof Product] !== undefined);
    if (keys.length === 0) {
        db.close();
        return resolve();
    }

    const updates = keys.map(key => `${key} = ?`).join(', ');
    const values = [...keys.map(k => product[k as keyof Product]), id];
    
    db.run(`UPDATE products SET ${updates} WHERE ID = ?`, values, (err) => {
      db.close();
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function deleteProduct(folderHash: string, id: number): Promise<void> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM products WHERE ID = ?', [id], (err) => {
      db.close();
      if (err) reject(err);
      else resolve();
    });
  });
}

// --- Inventory Operations ---

export async function addInventoryBatch(folderHash: string, batch: InventoryBatch): Promise<number> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO inventory (ProductID, purchase_price, sale_price, quantity, expiration_date_per_batch) VALUES (?, ?, ?, ?, ?)`,
      [batch.ProductID, batch.purchase_price, batch.sale_price, batch.quantity, batch.expiration_date_per_batch],
      function (err) {
        db.close();
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

export async function updateInventoryBatch(folderHash: string, orderId: number, batch: Partial<InventoryBatch>): Promise<void> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    const keys = Object.keys(batch).filter(k => batch[k as keyof InventoryBatch] !== undefined);
    if (keys.length === 0) {
        db.close();
        return resolve();
    }

    const updates = keys.map(key => `${key} = ?`).join(', ');
    const values = [...keys.map(k => batch[k as keyof InventoryBatch]), orderId];

    // Note: Primary key for inventory is OrderID
    db.run(`UPDATE inventory SET ${updates} WHERE OrderID = ?`, values, (err) => {
      db.close();
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function deleteInventoryBatch(folderHash: string, orderId: number): Promise<void> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM inventory WHERE OrderID = ?', [orderId], (err) => {
      db.close();
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function getProductStockLevel(folderHash: string, productId: number): Promise<number> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT SUM(quantity) as totalStock FROM inventory WHERE ProductID = ?',
      [productId],
      (err, row: { totalStock: number }) => {
        db.close();
        if (err) reject(err);
        else resolve(row?.totalStock || 0);
      }
    );
  });
}

export async function reduceInventoryFIFO(folderHash: string, productId: number, quantityToRemove: number): Promise<void> {
  const db = await connectToUserDatabase(folderHash);
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      db.all(
        'SELECT OrderID, quantity FROM inventory WHERE ProductID = ? AND quantity > 0 ORDER BY OrderID ASC',
        [productId],
        (err, batches: any[]) => {
          if (err) {
            db.run('ROLLBACK');
            db.close();
            return reject(err);
          }

          let remainingToRemove = quantityToRemove;
          const updates = [];

          for (const batch of batches) {
            if (remainingToRemove <= 0) break;

            const quantityToTake = Math.min(batch.quantity, remainingToRemove);
            remainingToRemove -= quantityToTake;
            const newQuantity = batch.quantity - quantityToTake;

            updates.push(new Promise<void>((res, rej) => {
              db.run('UPDATE inventory SET quantity = ? WHERE OrderID = ?', [newQuantity, batch.OrderID], (e) => {
                if (e) rej(e);
                else {
                    const movementDate = new Date().toISOString();
                    db.run('INSERT INTO StockMovement (movement_type, Quantity, MovementDate, InventoryID) VALUES (?, ?, ?, ?)', 
                        ['Out', quantityToTake, movementDate, batch.OrderID], (e2) => {
                           if(e2) rej(e2);
                           else res(); 
                        });
                }
              });
            }));
          }

          if (remainingToRemove > 0) {
            db.run('ROLLBACK');
            db.close();
            return reject(new Error('Insufficient stock'));
          }

          Promise.all(updates)
            .then(() => {
              db.run('COMMIT', (e) => {
                db.close();
                if (e) reject(e);
                else resolve();
              });
            })
            .catch((e) => {
              db.run('ROLLBACK');
              db.close();
              reject(e);
            });
        }
      );
    });
  });
}

// --- Customer Operations ---

export async function createCustomer(folderHash: string, customer: Customer): Promise<number> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO customers (name, phone_number, email) VALUES (?, ?, ?)',
      [customer.name, customer.phone_number, customer.email],
      function (err) {
        db.close();
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

export async function getCustomers(folderHash: string): Promise<Customer[]> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM customers', [], (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows as Customer[]);
    });
  });
}

export async function updateCustomer(folderHash: string, id: number, customer: Partial<Customer>): Promise<void> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    const keys = Object.keys(customer).filter(k => customer[k as keyof Customer] !== undefined);
    if (keys.length === 0) {
        db.close();
        return resolve();
    }
    const updates = keys.map(key => `${key} = ?`).join(', ');
    const values = [...keys.map(k => customer[k as keyof Customer]), id];
    
    db.run(`UPDATE customers SET ${updates} WHERE ID = ?`, values, (err) => {
      db.close();
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function deleteCustomer(folderHash: string, id: number): Promise<void> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM customers WHERE ID = ?', [id], (err) => {
      db.close();
      if (err) reject(err);
      else resolve();
    });
  });
}

// --- Supplier Operations ---

export async function createSupplier(folderHash: string, supplier: Supplier): Promise<number> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO suppliers (Name, phone_number, email) VALUES (?, ?, ?)',
      [supplier.Name, supplier.phone_number, supplier.email],
      function (err) {
        db.close();
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

export async function getSuppliers(folderHash: string): Promise<Supplier[]> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM suppliers', [], (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows as Supplier[]);
    });
  });
}

export async function updateSupplier(folderHash: string, id: number, supplier: Partial<Supplier>): Promise<void> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    const keys = Object.keys(supplier).filter(k => supplier[k as keyof Supplier] !== undefined);
    if (keys.length === 0) {
        db.close();
        return resolve();
    }
    const updates = keys.map(key => `${key} = ?`).join(', ');
    const values = [...keys.map(k => supplier[k as keyof Supplier]), id];
    
    db.run(`UPDATE suppliers SET ${updates} WHERE ID = ?`, values, (err) => {
      db.close();
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function deleteSupplier(folderHash: string, id: number): Promise<void> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    // Note: This might fail if PRAGMA foreign_keys = ON and there are dependent transactions/products
    db.run('DELETE FROM suppliers WHERE ID = ?', [id], (err) => {
      db.close();
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function linkSupplierToProduct(folderHash: string, supplierId: number, productId: number): Promise<void> {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT OR IGNORE INTO supplier_products (SupplierID, ProductID) VALUES (?, ?)',
            [supplierId, productId],
            (err) => {
                db.close();
                if(err) reject(err);
                else resolve();
            }
        )
    });
}

// --- Transaction & Analytics Operations ---

export async function createTransaction(folderHash: string, transaction: TransactionRecord): Promise<number> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO Transactions (TransactionType, payment_type, amount, SupplierID, CustomerID, TransactionDate) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [transaction.TransactionType, transaction.payment_type, transaction.amount, transaction.SupplierID, transaction.CustomerID, transaction.TransactionDate],
      function (err) {
        db.close();
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

export async function getTransactionHistory(folderHash: string, type?: 'Purchase' | 'Sale'): Promise<TransactionRecord[]> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM Transactions';
    const params = [];
    if (type) {
      query += ' WHERE TransactionType = ?';
      params.push(type);
    }
    query += ' ORDER BY TransactionDate DESC';

    db.all(query, params, (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows as TransactionRecord[]);
    });
  });
}

export async function updateTransaction(folderHash: string, id: number, transaction: Partial<TransactionRecord>): Promise<void> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    const keys = Object.keys(transaction).filter(k => transaction[k as keyof TransactionRecord] !== undefined);
    if (keys.length === 0) {
        db.close();
        return resolve();
    }
    const updates = keys.map(key => `${key} = ?`).join(', ');
    const values = [...keys.map(k => transaction[k as keyof TransactionRecord]), id];
    
    db.run(`UPDATE Transactions SET ${updates} WHERE ID = ?`, values, (err) => {
      db.close();
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function deleteTransaction(folderHash: string, id: number): Promise<void> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM Transactions WHERE ID = ?', [id], (err) => {
      db.close();
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function getLowStockAlerts(folderHash: string, threshold: number): Promise<any[]> {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        const query = `
            SELECT p.ID, p.name, SUM(i.quantity) as total_quantity 
            FROM products p 
            JOIN inventory i ON p.ID = i.ProductID 
            GROUP BY p.ID 
            HAVING total_quantity < ?
        `;
        db.all(query, [threshold], (err, rows) => {
            db.close();
            if(err) reject(err);
            else resolve(rows);
        });
    });
}

export async function getDailySalesTotal(folderHash: string, date: string): Promise<number> {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        const query = `
            SELECT SUM(amount) as total 
            FROM Transactions 
            WHERE TransactionType = 'Sale' AND date(TransactionDate) = date(?)
        `;
        db.get(query, [date], (err, row: {total: number}) => {
            db.close();
            if(err) reject(err);
            else resolve(row?.total || 0);
        });
    });
}