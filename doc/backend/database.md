# Database Documentation

## Overview

This system uses a multi-database architecture with SQLite for data persistence. The main database (`users.db`) handles user authentication and metadata, while each user has their own isolated business database (`user.db`). The system automatically collects and stores analytics in a JSON file (`stats.json`).

## Database Architecture

### Main Database (users.db)
**Location**: `./users.db` (project root)

#### Users Table
Stores user authentication, account information, and data isolation identifiers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique user identifier |
| shop_name | TEXT | NOT NULL | Name of the user's shop/business |
| email | TEXT | UNIQUE, NOT NULL | User's email address (login credential) |
| password_hash | TEXT | NOT NULL | BCrypt-hashed password (12 rounds) |
| folder_hash | TEXT | UNIQUE, NOT NULL | UUID for user's data directory isolation |

### User Database (user.db)
**Location**: `./data/{folder_hash}/user.db` (per-user isolated storage)

#### Products Table
Master catalog of all products in the inventory system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| ID | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique product identifier |
| name | TEXT | NOT NULL | Product display name |
| price | REAL | NOT NULL | Current selling price |
| nation_of_origin | TEXT | - | Country of origin |
| product_bar_code | TEXT | UNIQUE | Unique barcode identifier |
| expiration_date | INTEGER | - | Product shelf life expiration |

#### Inventory Table
Tracks individual inventory batches with cost and pricing data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| OrderID | INTEGER | PRIMARY KEY AUTOINCREMENT | Batch identifier (FIFO order) |
| ProductID | INTEGER | NOT NULL, FOREIGN KEY | References products(ID) ON DELETE CASCADE |
| purchase_price | REAL | NOT NULL | Cost price per unit |
| sale_price | REAL | NOT NULL | Selling price per unit |
| quantity | INTEGER | NOT NULL | Current stock quantity |
| expiration_date_per_batch | TEXT | - | Batch-specific expiration date |

#### Suppliers Table
Vendor and supplier management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| ID | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique supplier identifier |
| Name | TEXT | NOT NULL | Supplier business name |
| phone_number | TEXT | - | Primary contact number |
| email | TEXT | - | Business email address |

#### Supplier_Products Table
Many-to-many relationship between suppliers and products.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| SupplierID | INTEGER | PRIMARY KEY, FOREIGN KEY | References suppliers(ID) ON DELETE CASCADE |
| ProductID | INTEGER | PRIMARY KEY, FOREIGN KEY | References products(ID) ON DELETE CASCADE |

#### Supplier_Product_Pricing Table
Supplier-specific pricing and procurement details.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| ID | INTEGER | PRIMARY KEY AUTOINCREMENT | Pricing record identifier |
| SupplierID | INTEGER | NOT NULL, FOREIGN KEY | References suppliers(ID) ON DELETE CASCADE |
| ProductID | INTEGER | NOT NULL, FOREIGN KEY | References products(ID) ON DELETE CASCADE |
| supplier_price | REAL | NOT NULL DEFAULT 0 | Supplier's unit price |
| supplier_sku | TEXT | - | Supplier's SKU/reference code |
| min_order_quantity | INTEGER | DEFAULT 1 | Minimum order quantity |
| lead_time_days | INTEGER | DEFAULT 7 | Expected delivery time |
| is_active | BOOLEAN | DEFAULT 1 | Active supplier relationship |
| last_updated | TEXT | DEFAULT CURRENT_TIMESTAMP | Last price update timestamp |

#### Customers Table
Client and customer management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| ID | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique customer identifier |
| name | TEXT | NOT NULL | Customer full name |
| phone_number | TEXT | - | Primary contact number |
| email | TEXT | - | Contact email address |

#### Transactions Table
Financial transaction recording system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| ID | INTEGER | PRIMARY KEY AUTOINCREMENT | Transaction identifier |
| TransactionType | TEXT | NOT NULL CHECK | 'Purchase', 'Sale', 'Deposit', 'Withdrawal' |
| payment_type | TEXT | NOT NULL CHECK | 'paid' or 'owed' |
| amount | REAL | NOT NULL | Transaction monetary value |
| SupplierID | INTEGER | FOREIGN KEY | References suppliers(ID) |
| CustomerID | INTEGER | FOREIGN KEY | References customers(ID) |
| TransactionDate | TEXT | NOT NULL | Transaction timestamp |
| notes | TEXT | - | Additional transaction notes |

#### StockMovement Table
Inventory movement tracking for audit and analytics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| ID | INTEGER | PRIMARY KEY AUTOINCREMENT | Movement record identifier |
| movement_type | TEXT | NOT NULL CHECK | 'In' or 'Out' |
| Quantity | INTEGER | NOT NULL | Quantity moved |
| MovementDate | TEXT | NOT NULL | Movement timestamp |
| InventoryID | INTEGER | NOT NULL, FOREIGN KEY | References inventory(OrderID) |

## Analytics Data Structure (stats.json)

### File Location
`./stats.json` (project root)

### Data Format
```json
{
  "timestamp": "ISO 8601 timestamp",
  "total_users": 5,
  "users_analytics": [
    {
      "user_id": 1,
      "shop_name": "Example Shop",
      "collection_date": "ISO 8601 timestamp",
      "total_inventory_value": 15000.50,
      "today_sales": 500.25,
      "total_customers": 45,
      "total_products": 120,
      "pending_payments": 2500.75,
      "sales_trends": [...],
      "top_products": [...],
      "inventory_turnover": [...],
      "low_stock_alerts": [...],
      "inventory_valuation": [...],
      "profit_margin": {...},
      "daily_sales": {...},
      "payment_analysis": {...},
      "customer_lifetime_value": [...],
      "supplier_performance": [...]
    }
  ]
}
```

## Database Operations API

### Product Operations
- **createProduct()**: Adds new product to catalog with barcode validation
- **getProductByBarcode()**: Retrieves product by unique barcode
- **getAllProducts()**: Returns complete product catalog
- **updateProduct()**: Modifies product information
- **deleteProduct()**: Removes product (cascades to related records)

### Inventory Operations
- **addInventoryBatch()**: Creates new inventory batch with pricing
- **updateInventoryBatch()**: Modifies existing batch details
- **deleteInventoryBatch()**: Removes inventory batch
- **getProductStockLevel()**: Calculates current stock quantity
- **reduceInventoryFIFO()**: Reduces stock using First-In-First-Out method
- **getInventoryByProduct()**: Retrieves all batches for specific product

### Customer Operations
- **createCustomer()**: Adds new customer record
- **getCustomers()**: Retrieves all customers
- **updateCustomer()**: Modifies customer information
- **deleteCustomer()**: Removes customer record
- **getTransactionsByCustomer()**: Retrieves customer's transaction history

### Supplier Operations
- **createSupplier()**: Adds new supplier record
- **getSuppliers()**: Retrieves all suppliers
- **updateSupplier()**: Modifies supplier information
- **deleteSupplier()**: Removes supplier (with constraint checking)
- **linkSupplierToProduct()**: Creates supplier-product relationship with pricing
- **unlinkSupplierFromProduct()**: Removes supplier-product relationship
- **getProductsBySupplier()**: Retrieves all products from specific supplier
- **getSuppliersByProduct()**: Retrieves all suppliers for specific product
- **updateSupplierProductPricing()**: Updates supplier-specific product pricing
- **getTransactionsBySupplier()**: Retrieves supplier's transaction history

### Transaction Operations
- **createTransaction()**: Records financial transaction with automatic customer assignment
- **getTransactionHistory()**: Retrieves transaction history with optional type filtering
- **updateTransaction()**: Modifies transaction details
- **deleteTransaction()**: Removes transaction record

### Analytics Operations

#### Sales Analytics
- **getSalesTrends()**: Analyzes sales patterns by period (daily/weekly/monthly)
- **getTopProducts()**: Identifies best-selling products by revenue and quantity
- **getDailySalesTotal()**: Calculates total sales for specific date
- **getProfitMargin()**: Computes gross profit margin for period

#### Inventory Analytics
- **getLowStockAlerts()**: Identifies products below stock threshold
- **getInventoryTurnover()**: Calculates inventory turnover rates
- **getInventoryValuation()**: Computes current inventory monetary value

#### Customer Analytics
- **getCustomerLifetimeValue()**: Analyzes customer spending patterns and value
- **getTransactionsByCustomer()**: Retrieves customer purchase history

#### Financial Analytics
- **getPaymentAnalysis()**: Analyzes payment patterns and outstanding balances
- **getSupplierPerformance()**: Evaluates supplier reliability and performance

#### Complete Analytics
- **getUserAnalytics()**: Generates comprehensive analytics report for user

## Directory Structure

```
project-root/
├── users.db                    # Main authentication database
├── stats.json                  # System-wide analytics data (auto-generated)
├── data/                       # User data isolation directory
│   └── {folder_hash}/          # UUID-based user directory
│       ├── user.db            # User's business database
│       └── images/            # Product image storage
├── database_core.ts           # Database connection & schema management
├── database_ops.ts            # Complete business operations API
├── objects.ts                 # Analytics data type definitions
└── server.ts                  # Unified API server with stats collection
```

## Key Features

### Data Isolation & Security
- **Per-User Database**: Each user's business data is physically separated
- **Folder Hash System**: UUID-based directory isolation prevents data leakage
- **Foreign Key Enforcement**: All user databases enforce referential integrity
- **Cascade Deletion**: Related records automatically cleaned up

### Transaction Management
- **ACID Compliance**: All operations maintain database consistency
- **FIFO Inventory**: Stock reduction follows first-in-first-out methodology
- **Automatic Stock Movement**: Inventory changes trigger audit trail creation
- **Default Customer**: System ensures sales transactions always have customer association

### Analytics Engine
- **Automatic Collection**: Statistics collected every 6 hours
- **Comprehensive Metrics**: 15+ business intelligence metrics
- **JSON Storage**: Human-readable analytics storage
- **Public Access**: Statistics available via public API endpoint
- **Manual Triggers**: On-demand statistics collection available

### Performance Optimizations
- **Connection Pooling**: Efficient database connection management
- **Transaction Batching**: Related operations grouped for performance
- **Indexed Queries**: Optimized for analytics and reporting
- **Lazy Loading**: Analytics calculated on-demand

### Error Handling
- **Constraint Validation**: Database-level data integrity
- **Transaction Rollback**: Failed operations automatically rolled back
- **Graceful Degradation**: Analytics failures don't affect core operations
- **Detailed Logging**: Comprehensive error tracking and reporting

## Initialization Process

1. **Server Startup**: Main database connection established
2. **Schema Verification**: User table validated in users.db
3. **User Creation**: New users get isolated directory and database
4. **Schema Creation**: User database tables created with constraints
5. **Default Data**: Public/Client customer record automatically created
6. **Stats Collection**: Automatic analytics collection scheduled

## Statistics Collection Workflow

1. **Trigger**: Timer (6 hours) or manual API call
2. **User Enumeration**: All active users retrieved from users.db
3. **Parallel Processing**: Analytics collected for each user
4. **Data Aggregation**: User analytics compiled into summary
5. **File Storage**: Results saved to stats.json
6. **API Availability**: Statistics immediately available via public endpoint

## Security Considerations

### Current Implementation
- **Password Hashing**: BCrypt with 12 rounds
- **Data Isolation**: Physical separation of user data
- **Token Authentication**: JWT-based API access control
- **SQL Injection Protection**: Parameterized queries throughout

### Recommended Enhancements
- **Database Encryption**: SQLCipher for database-level encryption
- **API Rate Limiting**: Prevent brute force attacks
- **Audit Logging**: Comprehensive change tracking
- **Backup Automation**: Regular database backups

## Maintenance & Monitoring

### Automated Tasks
- Statistics collection every 6 hours
- Database integrity checks on connection
- Default customer verification

### Manual Tasks
- Periodic backup of stats.json
- Database optimization (vacuum)
- Log file rotation

### Monitoring Points
- stats.json file size growth
- Database connection counts
- Statistics collection duration
- Error rate in transaction processing

## Migration & Backup

### Statistics Data
- **Location**: `./stats.json`
- **Format**: JSON with timestamp
- **Backup**: Copy file to secure location
- **Restore**: Replace file and restart collection

### User Data
- **Location**: `./data/{folder_hash}/user.db`
- **Backup**: Individual SQLite file backup
- **Migration**: Copy user.db to new system

### Main Database
- **Location**: `./users.db`
- **Critical Data**: User credentials and folder mappings
- **Backup Strategy**: Regular SQLite backup with versioning