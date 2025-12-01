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

// --- Supplier-Product Unlinking ---

export async function unlinkSupplierFromProduct(
  folderHash: string, 
  supplierId: number, 
  productId: number
): Promise<void> {
  const db = await connectToUserDatabase(folderHash);
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      // 1. Delete from supplier_product_pricing first (due to foreign key constraints)
      db.run(
        'DELETE FROM supplier_product_pricing WHERE SupplierID = ? AND ProductID = ?',
        [supplierId, productId],
        (pricingErr) => {
          if (pricingErr) {
            db.run('ROLLBACK', () => {
              db.close();
              reject(new Error(`Failed to remove supplier pricing: ${pricingErr.message}`));
            });
            return;
          }
          
          // 2. Delete from supplier_products table
          db.run(
            'DELETE FROM supplier_products WHERE SupplierID = ? AND ProductID = ?',
            [supplierId, productId],
            (linkErr) => {
              if (linkErr) {
                db.run('ROLLBACK', () => {
                  db.close();
                  reject(new Error(`Failed to unlink supplier from product: ${linkErr.message}`));
                });
                return;
              }
              
              // Commit transaction
              db.run('COMMIT', (commitErr) => {
                if (commitErr) {
                  db.close();
                  reject(new Error(`Failed to commit transaction: ${commitErr.message}`));
                } else {
                  db.close();
                  resolve();
                }
              });
            }
          );
        }
      );
    });
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
export async function linkSupplierToProduct(
  folderHash: string, 
  supplierId: number, 
  productId: number,
  initialPricing?: {
    supplier_price?: number;
    supplier_sku?: string;
    min_order_quantity?: number;
    lead_time_days?: number;
    is_active?: boolean;
  }
): Promise<void> {
  const db = await connectToUserDatabase(folderHash);
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Begin transaction
      db.run('BEGIN TRANSACTION');
      
      // 1. First, verify that supplier and product exist
      db.get('SELECT 1 FROM suppliers WHERE ID = ?', [supplierId], (err, supplierRow) => {
        if (err) {
          db.run('ROLLBACK', () => {
            db.close();
            reject(new Error(`Supplier with ID ${supplierId} not found: ${err.message}`));
          });
          return;
        }
        
        if (!supplierRow) {
          db.run('ROLLBACK', () => {
            db.close();
            reject(new Error(`Supplier with ID ${supplierId} does not exist`));
          });
          return;
        }
        
        // 2. Verify product exists
        db.get('SELECT 1 FROM products WHERE ID = ?', [productId], (err, productRow) => {
          if (err) {
            db.run('ROLLBACK', () => {
              db.close();
              reject(new Error(`Product with ID ${productId} not found: ${err.message}`));
            });
            return;
          }
          
          if (!productRow) {
            db.run('ROLLBACK', () => {
              db.close();
              reject(new Error(`Product with ID ${productId} does not exist`));
            });
            return;
          }
          
          // 3. Link supplier to product in supplier_products table
          db.run(
            'INSERT OR IGNORE INTO supplier_products (SupplierID, ProductID) VALUES (?, ?)',
            [supplierId, productId],
            (err) => {
              if (err) {
                db.run('ROLLBACK', () => {
                  db.close();
                  reject(new Error(`Failed to link supplier to product: ${err.message}`));
                });
                return;
              }
              
              // 4. Create initial pricing record in supplier_product_pricing table
              // Validate that supplier_price is provided
              const supplierPrice = initialPricing?.supplier_price;
              if (supplierPrice === undefined || supplierPrice === null) {
                db.run('ROLLBACK', () => {
                  db.close();
                  reject(new Error('Supplier price is required'));
                });
                return;
              }
              
              if (supplierPrice < 0) {
                db.run('ROLLBACK', () => {
                  db.close();
                  reject(new Error('Supplier price cannot be negative'));
                });
                return;
              }
              
              db.run(
                `INSERT OR REPLACE INTO supplier_product_pricing 
                 (SupplierID, ProductID, supplier_price, supplier_sku, min_order_quantity, lead_time_days, is_active, last_updated)
                 VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [
                  supplierId, 
                  productId, 
                  supplierPrice,
                  initialPricing?.supplier_sku || null,
                  initialPricing?.min_order_quantity || 1,
                  initialPricing?.lead_time_days || 7,
                  initialPricing?.is_active !== undefined ? (initialPricing.is_active ? 1 : 0) : 1
                ],
                (pricingErr) => {
                  if (pricingErr) {
                    db.run('ROLLBACK', () => {
                      db.close();
                      reject(new Error(`Failed to set supplier pricing: ${pricingErr.message}`));
                    });
                    return;
                  }
                  
                  // Commit transaction
                  db.run('COMMIT', (commitErr) => {
                    if (commitErr) {
                      db.close();
                      reject(new Error(`Failed to commit transaction: ${commitErr.message}`));
                    } else {
                      db.close();
                      resolve();
                    }
                  });
                }
              );
            }
          );
        });
      });
    });
  });
}
// --- Transaction & Analytics Operations ---

export async function createTransaction(folderHash: string, transaction: TransactionRecord): Promise<number> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    // Determine CustomerID/SupplierID based on type for consistency.
    // Sale (to public/client) uses CustomerID 1 (assuming a placeholder 'public' client is created on setup).
    // Purchase uses SupplierID.
    const isSupplierTransaction = transaction.TransactionType === 'Purchase';
    const isClientSale = transaction.TransactionType === 'Sale';

    const supplierId = isSupplierTransaction ? transaction.SupplierID : null;
    // Assuming CustomerID 1 is a generic 'Public/Client' placeholder created on DB initialization.
    const customerId = isClientSale ? 1 : null; 

    db.run(
      `INSERT INTO Transactions (TransactionType, payment_type, amount, SupplierID, CustomerID, TransactionDate, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction.TransactionType, 
        transaction.payment_type, 
        transaction.amount, 
        supplierId, 
        customerId, 
        transaction.TransactionDate,
        transaction.notes || null // Added notes field
      ],
      function (err) {
        db.close();
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

// **UPDATED** to fetch all transactions and include SupplierName for the UI
export async function getTransactionHistory(folderHash: string): Promise<any[]> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        t.*, 
        s.Name as SupplierName
      FROM Transactions t
      LEFT JOIN suppliers s ON t.SupplierID = s.ID
      ORDER BY t.TransactionDate DESC, t.ID DESC
    `;
    db.all(query, [], (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows);
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

// Get all products for a specific supplier
export async function getProductsBySupplier(folderHash: string, supplierId: number): Promise<any[]> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        p.*,
        spp.supplier_price,
        spp.supplier_sku,
        spp.min_order_quantity,
        spp.lead_time_days,
        spp.is_active
      FROM products p
      INNER JOIN supplier_products sp ON p.ID = sp.ProductID
      LEFT JOIN supplier_product_pricing spp ON sp.SupplierID = spp.SupplierID AND sp.ProductID = spp.ProductID
      WHERE sp.SupplierID = ?
    `;
    db.all(query, [supplierId], (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Get all suppliers for a specific product
export async function getSuppliersByProduct(folderHash: string, productId: number): Promise<any[]> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        s.*,
        spp.supplier_price,
        spp.supplier_sku,
        spp.min_order_quantity,
        spp.lead_time_days,
        spp.is_active
      FROM suppliers s
      INNER JOIN supplier_products sp ON s.ID = sp.SupplierID
      LEFT JOIN supplier_product_pricing spp ON sp.SupplierID = spp.SupplierID AND sp.ProductID = spp.ProductID
      WHERE sp.ProductID = ?
    `;
    db.all(query, [productId], (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Get all supplier-product relationships with details
export async function getAllSupplierProductLinks(folderHash: string): Promise<any[]> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        s.ID as supplier_id,
        s.Name as supplier_name,
        p.ID as product_id,
        p.name as product_name,
        spp.supplier_price,
        spp.supplier_sku,
        spp.min_order_quantity,
        spp.lead_time_days,
        spp.is_active
      FROM supplier_products sp
      INNER JOIN suppliers s ON sp.SupplierID = s.ID
      INNER JOIN products p ON sp.ProductID = p.ID
      LEFT JOIN supplier_product_pricing spp ON sp.SupplierID = spp.SupplierID AND sp.ProductID = spp.ProductID
    `;
    db.all(query, [], (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Update supplier product pricing
export async function updateSupplierProductPricing(
  folderHash: string, 
  supplierId: number, 
  productId: number, 
  pricing: {
    supplier_price: number;
    supplier_sku?: string;
    min_order_quantity?: number;
    lead_time_days?: number;
    is_active?: boolean;
  }
): Promise<void> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR REPLACE INTO supplier_product_pricing 
       (SupplierID, ProductID, supplier_price, supplier_sku, min_order_quantity, lead_time_days, is_active, last_updated)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        supplierId, 
        productId, 
        pricing.supplier_price, 
        pricing.supplier_sku,
        pricing.min_order_quantity,
        pricing.lead_time_days,
        pricing.is_active
      ],
      (err) => {
        db.close();
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

// Get inventory batches for a specific product
export async function getInventoryByProduct(folderHash: string, productId: number): Promise<any[]> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    const query = `
      SELECT i.*, p.name as product_name
      FROM inventory i
      INNER JOIN products p ON i.ProductID = p.ID
      WHERE i.ProductID = ?
      ORDER BY i.OrderID ASC
    `;
    db.all(query, [productId], (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Get transactions for a specific customer
export async function getTransactionsByCustomer(folderHash: string, customerId: number): Promise<any[]> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    const query = `
      SELECT t.*, c.name as customer_name
      FROM Transactions t
      INNER JOIN customers c ON t.CustomerID = c.ID
      WHERE t.CustomerID = ?
      ORDER BY t.TransactionDate DESC
    `;
    db.all(query, [customerId], (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Get transactions for a specific supplier
export async function getTransactionsBySupplier(folderHash: string, supplierId: number): Promise<any[]> {
  const db = await connectToUserDatabase(folderHash);
  return new Promise((resolve, reject) => {
    const query = `
      SELECT t.*, s.Name as supplier_name
      FROM Transactions t
      INNER JOIN suppliers s ON t.SupplierID = s.ID
      WHERE t.SupplierID = ?
      ORDER BY t.TransactionDate DESC
    `;
    db.all(query, [supplierId], (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows);
    });
  });
}