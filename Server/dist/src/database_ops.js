import { connectToUserDatabase } from './database_core.js';
import { DEFAULT_ANALYTICS } from './objects.js';
export async function createProduct(folderHash, product) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO products (name, price, nation_of_origin, product_bar_code, expiration_date) VALUES (?, ?, ?, ?, ?)`, [product.name, product.price, product.nation_of_origin, product.product_bar_code, product.expiration_date], function (err) {
            db.close();
            if (err)
                reject(err);
            else
                resolve(this.lastID);
        });
    });
}
export async function unlinkSupplierFromProduct(folderHash, supplierId, productId) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            db.run('DELETE FROM supplier_product_pricing WHERE SupplierID = ? AND ProductID = ?', [supplierId, productId], (pricingErr) => {
                if (pricingErr) {
                    db.run('ROLLBACK', () => {
                        db.close();
                        reject(new Error(`Failed to remove supplier pricing: ${pricingErr.message}`));
                    });
                    return;
                }
                db.run('DELETE FROM supplier_products WHERE SupplierID = ? AND ProductID = ?', [supplierId, productId], (linkErr) => {
                    if (linkErr) {
                        db.run('ROLLBACK', () => {
                            db.close();
                            reject(new Error(`Failed to unlink supplier from product: ${linkErr.message}`));
                        });
                        return;
                    }
                    db.run('COMMIT', (commitErr) => {
                        if (commitErr) {
                            db.close();
                            reject(new Error(`Failed to commit transaction: ${commitErr.message}`));
                        }
                        else {
                            db.close();
                            resolve();
                        }
                    });
                });
            });
        });
    });
}
export async function getProductByBarcode(folderHash, barcode) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM products WHERE product_bar_code = ?', [barcode], (err, row) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve(row);
        });
    });
}
export async function getAllProducts(folderHash) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM products', [], (err, rows) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}
export async function updateProduct(folderHash, id, product) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        const keys = Object.keys(product).filter(k => product[k] !== undefined);
        if (keys.length === 0) {
            db.close();
            return resolve();
        }
        const updates = keys.map(key => `${key} = ?`).join(', ');
        const values = [...keys.map(k => product[k]), id];
        db.run(`UPDATE products SET ${updates} WHERE ID = ?`, values, (err) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
export async function deleteProduct(folderHash, id) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM products WHERE ID = ?', [id], (err) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
export async function addInventoryBatch(folderHash, batch) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO inventory (ProductID, purchase_price, sale_price, quantity, expiration_date_per_batch) VALUES (?, ?, ?, ?, ?)`, [batch.ProductID, batch.purchase_price, batch.sale_price, batch.quantity, batch.expiration_date_per_batch], function (err) {
            db.close();
            if (err)
                reject(err);
            else
                resolve(this.lastID);
        });
    });
}
export async function updateInventoryBatch(folderHash, orderId, batch) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        const keys = Object.keys(batch).filter(k => batch[k] !== undefined);
        if (keys.length === 0) {
            db.close();
            return resolve();
        }
        const updates = keys.map(key => `${key} = ?`).join(', ');
        const values = [...keys.map(k => batch[k]), orderId];
        db.run(`UPDATE inventory SET ${updates} WHERE OrderID = ?`, values, (err) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
export async function deleteInventoryBatch(folderHash, orderId) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM inventory WHERE OrderID = ?', [orderId], (err) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
export async function getProductStockLevel(folderHash, productId) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        db.get('SELECT SUM(quantity) as totalStock FROM inventory WHERE ProductID = ?', [productId], (err, row) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve(row?.totalStock || 0);
        });
    });
}
export async function reduceInventoryFIFO(folderHash, productId, quantityToRemove) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            db.all('SELECT OrderID, quantity FROM inventory WHERE ProductID = ? AND quantity > 0 ORDER BY OrderID ASC', [productId], (err, batches) => {
                if (err) {
                    db.run('ROLLBACK');
                    db.close();
                    return reject(err);
                }
                let remainingToRemove = quantityToRemove;
                const updates = [];
                for (const batch of batches) {
                    if (remainingToRemove <= 0)
                        break;
                    const quantityToTake = Math.min(batch.quantity, remainingToRemove);
                    remainingToRemove -= quantityToTake;
                    const newQuantity = batch.quantity - quantityToTake;
                    updates.push(new Promise((res, rej) => {
                        db.run('UPDATE inventory SET quantity = ? WHERE OrderID = ?', [newQuantity, batch.OrderID], (e) => {
                            if (e)
                                rej(e);
                            else {
                                const movementDate = new Date().toISOString();
                                db.run('INSERT INTO StockMovement (movement_type, Quantity, MovementDate, InventoryID) VALUES (?, ?, ?, ?)', ['Out', quantityToTake, movementDate, batch.OrderID], (e2) => {
                                    if (e2)
                                        rej(e2);
                                    else
                                        res();
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
                        if (e)
                            reject(e);
                        else
                            resolve();
                    });
                })
                    .catch((e) => {
                    db.run('ROLLBACK');
                    db.close();
                    reject(e);
                });
            });
        });
    });
}
export async function createCustomer(folderHash, customer) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO customers (name, phone_number, email) VALUES (?, ?, ?)', [customer.name, customer.phone_number, customer.email], function (err) {
            db.close();
            if (err)
                reject(err);
            else
                resolve(this.lastID);
        });
    });
}
export async function getCustomers(folderHash) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM customers', [], (err, rows) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}
export async function updateCustomer(folderHash, id, customer) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        const keys = Object.keys(customer).filter(k => customer[k] !== undefined);
        if (keys.length === 0) {
            db.close();
            return resolve();
        }
        const updates = keys.map(key => `${key} = ?`).join(', ');
        const values = [...keys.map(k => customer[k]), id];
        db.run(`UPDATE customers SET ${updates} WHERE ID = ?`, values, (err) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
export async function deleteCustomer(folderHash, id) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM customers WHERE ID = ?', [id], (err) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
export async function createSupplier(folderHash, supplier) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO suppliers (Name, phone_number, email) VALUES (?, ?, ?)', [supplier.Name, supplier.phone_number, supplier.email], function (err) {
            db.close();
            if (err)
                reject(err);
            else
                resolve(this.lastID);
        });
    });
}
export async function getSuppliers(folderHash) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM suppliers', [], (err, rows) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}
export async function updateSupplier(folderHash, id, supplier) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        const keys = Object.keys(supplier).filter(k => supplier[k] !== undefined);
        if (keys.length === 0) {
            db.close();
            return resolve();
        }
        const updates = keys.map(key => `${key} = ?`).join(', ');
        const values = [...keys.map(k => supplier[k]), id];
        db.run(`UPDATE suppliers SET ${updates} WHERE ID = ?`, values, (err) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
export async function deleteSupplier(folderHash, id) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM suppliers WHERE ID = ?', [id], (err) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
export async function linkSupplierToProduct(folderHash, supplierId, productId, initialPricing) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
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
                    db.run('INSERT OR IGNORE INTO supplier_products (SupplierID, ProductID) VALUES (?, ?)', [supplierId, productId], (err) => {
                        if (err) {
                            db.run('ROLLBACK', () => {
                                db.close();
                                reject(new Error(`Failed to link supplier to product: ${err.message}`));
                            });
                            return;
                        }
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
                        db.run(`INSERT OR REPLACE INTO supplier_product_pricing 
                 (SupplierID, ProductID, supplier_price, supplier_sku, min_order_quantity, lead_time_days, is_active, last_updated)
                 VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`, [
                            supplierId,
                            productId,
                            supplierPrice,
                            initialPricing?.supplier_sku || null,
                            initialPricing?.min_order_quantity || 1,
                            initialPricing?.lead_time_days || 7,
                            initialPricing?.is_active !== undefined ? (initialPricing.is_active ? 1 : 0) : 1
                        ], (pricingErr) => {
                            if (pricingErr) {
                                db.run('ROLLBACK', () => {
                                    db.close();
                                    reject(new Error(`Failed to set supplier pricing: ${pricingErr.message}`));
                                });
                                return;
                            }
                            db.run('COMMIT', (commitErr) => {
                                if (commitErr) {
                                    db.close();
                                    reject(new Error(`Failed to commit transaction: ${commitErr.message}`));
                                }
                                else {
                                    db.close();
                                    resolve();
                                }
                            });
                        });
                    });
                });
            });
        });
    });
}
export async function createTransaction(folderHash, transaction) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        const ensureDefaultCustomer = (callback) => {
            db.get('SELECT ID FROM customers WHERE name = ?', ['Public/Client'], (err, row) => {
                if (err)
                    return callback(err, 1);
                if (!row) {
                    db.run('INSERT INTO customers (name, email) VALUES (?, ?)', ['Public/Client', 'public@client.com'], function (err) {
                        if (err)
                            callback(err, 1);
                        else
                            callback(null, this.lastID);
                    });
                }
                else {
                    callback(null, row.ID);
                }
            });
        };
        ensureDefaultCustomer((err, defaultCustomerId) => {
            if (err) {
                db.close();
                return reject(err);
            }
            const isSupplierTransaction = transaction.TransactionType === 'Purchase';
            const isClientSale = transaction.TransactionType === 'Sale';
            const supplierId = isSupplierTransaction ? transaction.SupplierID : null;
            const customerId = isClientSale ? (transaction.CustomerID || defaultCustomerId) : null;
            db.run(`INSERT INTO Transactions (TransactionType, payment_type, amount, SupplierID, CustomerID, TransactionDate, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                transaction.TransactionType,
                transaction.payment_type,
                transaction.amount,
                supplierId,
                customerId,
                transaction.TransactionDate,
                transaction.notes || null
            ], function (err) {
                db.close();
                if (err)
                    reject(err);
                else
                    resolve(this.lastID);
            });
        });
    });
}
export async function getTransactionHistory(folderHash, transactionType) {
    const db = await connectToUserDatabase(folderHash);
    let query = `
    SELECT 
      t.*, 
      s.Name as SupplierName
    FROM Transactions t
    LEFT JOIN suppliers s ON t.SupplierID = s.ID
  `;
    const params = [];
    if (transactionType) {
        query += ' WHERE t.TransactionType = ?';
        params.push(transactionType);
    }
    query += ' ORDER BY t.TransactionDate DESC, t.ID DESC';
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}
export async function updateTransaction(folderHash, id, transaction) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        const keys = Object.keys(transaction).filter(k => transaction[k] !== undefined);
        if (keys.length === 0) {
            db.close();
            return resolve();
        }
        const updates = keys.map(key => `${key} = ?`).join(', ');
        const values = [...keys.map(k => transaction[k]), id];
        db.run(`UPDATE Transactions SET ${updates} WHERE ID = ?`, values, (err) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
export async function deleteTransaction(folderHash, id) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM Transactions WHERE ID = ?', [id], (err) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
export async function getLowStockAlerts(folderHash, threshold) {
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
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}
export async function getDailySalesTotal(folderHash, date) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        const query = `
            SELECT SUM(amount) as total 
            FROM Transactions 
            WHERE TransactionType = 'Sale' AND date(TransactionDate) = date(?)
        `;
        db.get(query, [date], (err, row) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve(row?.total || 0);
        });
    });
}
export async function getProductsBySupplier(folderHash, supplierId) {
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
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}
export async function getSuppliersByProduct(folderHash, productId) {
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
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}
export async function getAllSupplierProductLinks(folderHash) {
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
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}
export async function updateSupplierProductPricing(folderHash, supplierId, productId, pricing) {
    const db = await connectToUserDatabase(folderHash);
    return new Promise((resolve, reject) => {
        db.run(`INSERT OR REPLACE INTO supplier_product_pricing 
       (SupplierID, ProductID, supplier_price, supplier_sku, min_order_quantity, lead_time_days, is_active, last_updated)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`, [
            supplierId,
            productId,
            pricing.supplier_price,
            pricing.supplier_sku,
            pricing.min_order_quantity,
            pricing.lead_time_days,
            pricing.is_active
        ], (err) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
export async function getInventoryByProduct(folderHash, productId) {
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
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}
export async function getTransactionsByCustomer(folderHash, customerId) {
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
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}
export async function getTransactionsBySupplier(folderHash, supplierId) {
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
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}
export async function getSalesTrends(folderHash, period, startDate, endDate) {
    const db = await connectToUserDatabase(folderHash);
    let dateFormat, interval;
    switch (period) {
        case 'daily':
            dateFormat = 'date(TransactionDate)';
            interval = 'GROUP BY date(TransactionDate)';
            break;
        case 'weekly':
            dateFormat = "strftime('%Y-%W', TransactionDate)";
            interval = 'GROUP BY strftime("%Y-%W", TransactionDate)';
            break;
        case 'monthly':
            dateFormat = "strftime('%Y-%m', TransactionDate)";
            interval = 'GROUP BY strftime("%Y-%m", TransactionDate)';
            break;
        default:
            dateFormat = "strftime('%Y-%m', TransactionDate)";
            interval = 'GROUP BY strftime("%Y-%m", TransactionDate)';
    }
    const query = `
    SELECT 
      ${dateFormat} as period,
      COALESCE(SUM(amount), 0) as total_sales,
      COUNT(*) as transaction_count
    FROM Transactions 
    WHERE TransactionType = 'Sale' 
      AND TransactionDate BETWEEN ? AND ?
    ${interval}
    ORDER BY period
  `;
    return new Promise((resolve, reject) => {
        db.all(query, [startDate, endDate], (err, rows) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}
export async function getTopProducts(folderHash, limit = 10, startDate, endDate) {
    const db = await connectToUserDatabase(folderHash);
    const dateCondition = startDate && endDate
        ? 'AND sm.MovementDate BETWEEN ? AND ?'
        : '';
    const params = startDate && endDate
        ? [startDate, endDate, limit]
        : [limit];
    const query = `
    SELECT 
      p.ID,
      p.name,
      p.product_bar_code,
      COALESCE(SUM(sm.Quantity), 0) as total_quantity_sold,
      COUNT(DISTINCT sm.InventoryID) as sale_occurrences,
      COALESCE(AVG(i.sale_price), 0) as avg_sale_price,
      COALESCE(SUM(sm.Quantity) * AVG(i.sale_price), 0) as estimated_revenue
    FROM StockMovement sm
    JOIN inventory i ON sm.InventoryID = i.OrderID
    JOIN products p ON i.ProductID = p.ID
    WHERE sm.movement_type = 'Out'
      ${dateCondition}
    GROUP BY p.ID
    ORDER BY total_quantity_sold DESC
    LIMIT ?
  `;
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}
export async function getInventoryTurnover(folderHash, productId) {
    const db = await connectToUserDatabase(folderHash);
    const productCondition = productId ? 'WHERE p.ID = ?' : '';
    const params = productId ? [productId] : [];
    const query = `
    SELECT 
      p.ID,
      p.name,
      COALESCE(SUM(CASE WHEN sm.movement_type = 'Out' THEN sm.Quantity ELSE 0 END), 0) as total_sold,
      COALESCE(AVG(i.quantity), 0) as avg_inventory,
      CASE 
        WHEN COALESCE(AVG(i.quantity), 0) > 0 
        THEN COALESCE(SUM(CASE WHEN sm.movement_type = 'Out' THEN sm.Quantity ELSE 0 END), 0) / AVG(i.quantity)
        ELSE 0 
      END as turnover_rate
    FROM products p
    LEFT JOIN inventory i ON p.ID = i.ProductID
    LEFT JOIN StockMovement sm ON i.OrderID = sm.InventoryID 
      AND sm.movement_type = 'Out'
      AND sm.MovementDate >= date('now', '-30 days')
    ${productCondition}
    GROUP BY p.ID
    ORDER BY turnover_rate DESC
  `;
    return new Promise((resolve, reject) => {
        if (productId) {
            db.get(query, params, (err, row) => {
                db.close();
                if (err)
                    reject(err);
                else
                    resolve(row || {
                        ID: productId,
                        name: '',
                        total_sold: 0,
                        avg_inventory: 0,
                        turnover_rate: 0
                    });
            });
        }
        else {
            db.all(query, params, (err, rows) => {
                db.close();
                if (err)
                    reject(err);
                else
                    resolve(rows);
            });
        }
    });
}
export async function getProfitMargin(folderHash, startDate, endDate) {
    const db = await connectToUserDatabase(folderHash);
    const query = `
    SELECT 
      (SELECT COALESCE(SUM(amount), 0) 
       FROM Transactions 
       WHERE TransactionType = 'Sale' 
         AND payment_type = 'paid'
         AND TransactionDate BETWEEN ? AND ?) as total_revenue,
      
      (SELECT COALESCE(SUM(sm.Quantity * i.purchase_price), 0)
       FROM StockMovement sm
       JOIN inventory i ON sm.InventoryID = i.OrderID
       WHERE sm.movement_type = 'Out'
         AND sm.MovementDate BETWEEN ? AND ?) as total_cogs,
      
      (SELECT COALESCE(SUM(amount), 0) 
       FROM Transactions 
       WHERE TransactionType = 'Sale' 
         AND payment_type = 'paid'
         AND TransactionDate BETWEEN ? AND ?) 
       - 
      (SELECT COALESCE(SUM(sm.Quantity * i.purchase_price), 0)
       FROM StockMovement sm
       JOIN inventory i ON sm.InventoryID = i.OrderID
       WHERE sm.movement_type = 'Out'
         AND sm.MovementDate BETWEEN ? AND ?) as gross_profit
  `;
    return new Promise((resolve, reject) => {
        db.get(query, [startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate], (err, row) => {
            db.close();
            if (err) {
                reject(err);
            }
            else {
                const data = row || { total_revenue: 0, total_cogs: 0, gross_profit: 0 };
                const gross_margin = data.total_revenue > 0
                    ? (data.gross_profit / data.total_revenue) * 100
                    : 0;
                resolve({
                    total_revenue: data.total_revenue || 0,
                    total_cogs: data.total_cogs || 0,
                    gross_profit: data.gross_profit || 0,
                    gross_margin_percentage: parseFloat(gross_margin.toFixed(2))
                });
            }
        });
    });
}
export async function getCustomerLifetimeValue(folderHash) {
    const db = await connectToUserDatabase(folderHash);
    const query = `
    SELECT 
      c.ID,
      c.name,
      c.email,
      COUNT(t.ID) as total_transactions,
      COALESCE(SUM(t.amount), 0) as total_spent,
      COALESCE(AVG(t.amount), 0) as avg_transaction_value,
      MIN(t.TransactionDate) as first_purchase,
      MAX(t.TransactionDate) as last_purchase
    FROM customers c
    LEFT JOIN Transactions t ON c.ID = t.CustomerID 
      AND t.TransactionType = 'Sale'
    WHERE c.ID != 1 
    GROUP BY c.ID
    ORDER BY total_spent DESC
  `;
    return new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}
export async function getSupplierPerformance(folderHash) {
    const db = await connectToUserDatabase(folderHash);
    const query = `
    SELECT 
      s.ID,
      s.Name,
      COUNT(t.ID) as total_purchases,
      COALESCE(AVG(spp.lead_time_days), 7) as avg_lead_time,
      COUNT(CASE WHEN t.TransactionDate <= date(t.TransactionDate, '+' || spp.lead_time_days || ' days') THEN 1 END) as on_time_deliveries
    FROM suppliers s
    LEFT JOIN Transactions t ON s.ID = t.SupplierID 
      AND t.TransactionType = 'Purchase'
    LEFT JOIN supplier_product_pricing spp ON s.ID = spp.SupplierID
    GROUP BY s.ID
    ORDER BY total_purchases DESC
  `;
    return new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}
export async function getInventoryValuation(folderHash) {
    const db = await connectToUserDatabase(folderHash);
    const query = `
    SELECT 
      p.ID as product_id,
      p.name as product_name,
      COALESCE(SUM(i.quantity), 0) as total_quantity,
      COALESCE(AVG(i.purchase_price), 0) as avg_purchase_price,
      COALESCE(SUM(i.quantity * i.purchase_price), 0) as current_value
    FROM products p
    LEFT JOIN inventory i ON p.ID = i.ProductID
    GROUP BY p.ID
    ORDER BY current_value DESC
  `;
    return new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}
export async function getPaymentAnalysis(folderHash) {
    const db = await connectToUserDatabase(folderHash);
    const query = `
    SELECT 
      COALESCE(SUM(CASE WHEN payment_type = 'owed' THEN amount ELSE 0 END), 0) as total_owed,
      COALESCE(SUM(CASE WHEN payment_type = 'paid' THEN amount ELSE 0 END), 0) as total_paid,
      COALESCE(SUM(CASE WHEN payment_type = 'owed' THEN amount ELSE 0 END), 0) as outstanding_balance
    FROM Transactions
  `;
    return new Promise((resolve, reject) => {
        db.get(query, [], (err, row) => {
            db.close();
            if (err)
                reject(err);
            else
                resolve(row || {
                    total_owed: 0,
                    total_paid: 0,
                    outstanding_balance: 0
                });
        });
    });
}
export async function getUserAnalytics(folderHash, userId, shopName) {
    try {
        const defaultEndDate = new Date().toISOString().split('T')[0];
        const defaultStartDate = new Date();
        defaultStartDate.setMonth(defaultStartDate.getMonth() - 12);
        const startDate = defaultStartDate.toISOString().split('T')[0];
        const endDate = defaultEndDate;
        const [salesTrends, topProducts, inventoryTurnover, profitMargin, lowStockAlerts, dailySales, customerLifetime, supplierPerformance, inventoryValuation, paymentAnalysis] = await Promise.all([
            getSalesTrends(folderHash, 'monthly', startDate, endDate),
            getTopProducts(folderHash, 10, startDate, endDate),
            getInventoryTurnover(folderHash),
            getProfitMargin(folderHash, startDate, endDate),
            getLowStockAlerts(folderHash, 10),
            getDailySalesTotal(folderHash, endDate),
            getCustomerLifetimeValue(folderHash),
            getSupplierPerformance(folderHash),
            getInventoryValuation(folderHash),
            getPaymentAnalysis(folderHash)
        ]);
        const totalInventoryValue = inventoryValuation.reduce((sum, item) => sum + item.current_value, 0);
        const db = await connectToUserDatabase(folderHash);
        const counts = await new Promise((resolve, reject) => {
            db.serialize(() => {
                db.get('SELECT COUNT(*) as total_customers FROM customers WHERE ID != 1', (err, customerRow) => {
                    if (err) {
                        db.close();
                        reject(err);
                        return;
                    }
                    db.get('SELECT COUNT(*) as total_products FROM products', (err, productRow) => {
                        db.close();
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve({
                            total_customers: customerRow?.total_customers || 0,
                            total_products: productRow?.total_products || 0
                        });
                    });
                });
            });
        });
        return {
            user_id: userId,
            shop_name: shopName,
            collection_date: new Date().toISOString(),
            total_inventory_value: totalInventoryValue,
            today_sales: dailySales,
            total_customers: counts.total_customers,
            total_products: counts.total_products,
            pending_payments: paymentAnalysis.outstanding_balance,
            sales_trends: salesTrends,
            top_products: topProducts,
            inventory_turnover: Array.isArray(inventoryTurnover) ? inventoryTurnover : [inventoryTurnover],
            low_stock_alerts: lowStockAlerts,
            inventory_valuation: inventoryValuation,
            profit_margin: profitMargin,
            daily_sales: { total: dailySales, date: endDate },
            payment_analysis: paymentAnalysis,
            customer_lifetime_value: customerLifetime,
            supplier_performance: supplierPerformance
        };
    }
    catch (error) {
        console.error(`Error generating analytics for user ${userId}:`, error);
        return {
            ...DEFAULT_ANALYTICS,
            user_id: userId,
            shop_name: shopName,
            collection_date: new Date().toISOString()
        };
    }
}
//# sourceMappingURL=database_ops.js.map