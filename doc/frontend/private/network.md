# API Functions Quick Reference

## Authentication
| Function | What It Gets | Endpoint |
|----------|-------------|----------|
| `login()` | JWT token string | `POST /api/login` |
| `register()` | JWT token string | `POST /api/register` |

## Product Management
| Function | What It Gets | Endpoint |
|----------|-------------|----------|
| `createProduct()` | Object with `batchId` | `POST /api/products` |
| `fetchProducts()` | Object with `success` and array of products | `GET /api/products` |
| `fetchProductByBarcode()` | Object with `success` and single product | `GET /api/products/barcode/{barcode}` |
| `updateProduct()` | Object with `success` and optional message | `PUT /api/products/{id}` |

## Inventory Management
| Function | What It Gets | Endpoint |
|----------|-------------|----------|
| `addInventoryBatch()` | Object with `batchId` | `POST /api/inventory` |
| `fetchStockLevel()` | Object with `stockLevel` number | `GET /api/inventory/stock-level/{productId}` |
| `reduceInventory()` | Object with `success` and optional message | `POST /api/inventory/reduce` |

## Customer Management
| Function | What It Gets | Endpoint |
|----------|-------------|----------|
| `createCustomer()` | Object with `batchId` | `POST /api/customers` |
| `fetchCustomers()` | Object with `success` and array of customers | `GET /api/customers` |

## Supplier Management
| Function | What It Gets | Endpoint |
|----------|-------------|----------|
| `createSupplier()` | Object with `batchId` | `POST /api/suppliers` |
| `fetchSuppliers()` | Object with `success` and array of suppliers | `GET /api/suppliers` |
| `linkSupplierProduct()` | Object with `success` and optional message | `POST /api/suppliers/link` |

## Transaction Management
| Function | What It Gets | Endpoint |
|----------|-------------|----------|
| `createTransaction()` | Object with `batchId` | `POST /api/transactions` |
| `fetchTransactions()` | Object with `success` and array of transactions | `GET /api/transactions` |

## Analytics
| Function | What It Gets | Endpoint |
|----------|-------------|----------|
| `fetchLowStockAlerts()` | Object with `success` and array of low stock alerts | `GET /api/analytics/low-stock` |
| `fetchDailySales()` | Object with `success` and `dailySales` number | `GET /api/analytics/daily-sales` |

## Response Pattern Summary
- **Create operations** (`createProduct`, `createCustomer`, etc.): Return `{ batchId: number }`
- **Fetch multiple items** (`fetchProducts`, `fetchCustomers`, etc.): Return `{ success: boolean, items: Array }`
- **Fetch single item** (`fetchProductByBarcode`, `fetchStockLevel`): Return `{ success: boolean, item: Object }` or `{ data: value }`
- **Update operations** (`updateProduct`, `reduceInventory`, etc.): Return `{ success: boolean, message?: string }`
- **Authentication**: Return JWT token string directly

# Inventory Management System API Client Documentation

## Overview

Base URL: Can be modefied as needed

This API client provides a comprehensive interface for interacting with the Inventory Management System. All functions return Promises and use JWT tokens for authentication.

### Authentication
- Uses JWT tokens for authentication
- Tokens must be included in the `Authorization` header as: `Bearer <token>`
- All endpoints (except login/register) require valid authentication

### Error Handling
All API functions throw JavaScript `Error` objects with descriptive messages when requests fail. The error messages are extracted from server responses when available.

## Authentication Functions

### login
Authenticates a user and returns a JWT token.

**Function:** `login(payload)`
**Endpoint:** `POST /api/login`

**Parameters:**
- `payload`: Object containing:
  - `email`: User's email address (string, required)
  - `password`: User's password (string, required)

**Returns:** Promise that resolves to JWT token string

**Throws:** Error with message from server or generic "Login failed"

### register
Creates a new user account and returns a JWT token.

**Function:** `register(payload)`
**Endpoint:** `POST /api/register`

**Parameters:**
- `payload`: Object containing:
  - `shopName`: Name of the shop/business (string, required)
  - `email`: User's email address (string, required)
  - `password`: User's password (string, required)

**Returns:** Promise that resolves to JWT token string

**Throws:** Error with message from server or generic "Registration failed"

## Product Management

### createProduct
Creates a new product in the inventory.

**Function:** `createProduct(token, payload)`
**Endpoint:** `POST /api/products`
**Authentication:** Required

**Parameters:**
- `token`: JWT authentication token
- `payload`: Object containing:
  - `name`: Product name (string, required)
  - `price`: Product price (number, required)
  - `nation_of_origin`: Country of origin (string, optional)
  - `product_bar_code`: Unique barcode (string, required)
  - `expiration_date`: Expiration date in timestamp (number, optional)

**Returns:** Promise that resolves to object with `batchId` (number)

**Throws:** Error with "Failed to create product"

### fetchProducts
Retrieves all products for the authenticated user.

**Function:** `fetchProducts(token)`
**Endpoint:** `GET /api/products`
**Authentication:** Required

**Parameters:**
- `token`: JWT authentication token

**Returns:** Promise that resolves to object with `success` (boolean) and `products` (array of product objects)

**Throws:** Error with "Failed to fetch products"

### fetchProductByBarcode
Retrieves a specific product by its barcode.

**Function:** `fetchProductByBarcode(token, barcode)`
**Endpoint:** `GET /api/products/barcode/{barcode}`
**Authentication:** Required

**Parameters:**
- `token`: JWT authentication token
- `barcode`: Product barcode to search for (string)

**Returns:** Promise that resolves to object with `success` (boolean) and `product` (product object)

**Throws:** Error with "Product not found"

### updateProduct
Updates an existing product's information.

**Function:** `updateProduct(token, id, payload)`
**Endpoint:** `PUT /api/products/{id}`
**Authentication:** Required

**Parameters:**
- `token`: JWT authentication token
- `id`: Product ID to update (number)
- `payload`: Object containing fields to update (partial product data)

**Returns:** Promise that resolves to object with `success` (boolean) and optional `message` (string)

**Throws:** Error with "Failed to update product"

## Inventory Management

### addInventoryBatch
Adds a new batch of inventory for a product.

**Function:** `addInventoryBatch(token, payload)`
**Endpoint:** `POST /api/inventory`
**Authentication:** Required

**Parameters:**
- `token`: JWT authentication token
- `payload`: Object containing:
  - `ProductID`: Product ID (number, required)
  - `purchase_price`: Purchase price per unit (number, required)
  - `sale_price`: Sale price per unit (number, required)
  - `quantity`: Quantity in batch (number, required)
  - `expiration_date_per_batch`: Batch expiration date (string, optional)

**Returns:** Promise that resolves to object with `batchId` (number)

**Throws:** Error with "Failed to add inventory batch"

### fetchStockLevel
Retrieves current stock level for a specific product.

**Function:** `fetchStockLevel(token, productId)`
**Endpoint:** `GET /api/inventory/stock-level/{productId}`
**Authentication:** Required

**Parameters:**
- `token`: JWT authentication token
- `productId`: Product ID to check stock for (number)

**Returns:** Promise that resolves to object with `stockLevel` (number)

**Throws:** Error with "Failed to fetch stock level"

### reduceInventory
Reduces inventory quantity for a product (typically for sales).

**Function:** `reduceInventory(token, payload)`
**Endpoint:** `POST /api/inventory/reduce`
**Authentication:** Required

**Parameters:**
- `token`: JWT authentication token
- `payload`: Object containing:
  - `productId`: Product ID to reduce (number, required)
  - `quantity`: Quantity to reduce (number, required)

**Returns:** Promise that resolves to object with `success` (boolean) and optional `message` (string)

**Throws:** Error with "Failed to reduce inventory"

## Customer Management

### createCustomer
Creates a new customer record.

**Function:** `createCustomer(token, payload)`
**Endpoint:** `POST /api/customers`
**Authentication:** Required

**Parameters:**
- `token`: JWT authentication token
- `payload`: Object containing:
  - `name`: Customer name (string, required)
  - `phone_number`: Phone number (string, optional)
  - `email`: Email address (string, optional)

**Returns:** Promise that resolves to object with `batchId` (number)

**Throws:** Error with "Failed to create customer"

### fetchCustomers
Retrieves all customers for the authenticated user.

**Function:** `fetchCustomers(token)`
**Endpoint:** `GET /api/customers`
**Authentication:** Required

**Parameters:**
- `token`: JWT authentication token

**Returns:** Promise that resolves to object with `success` (boolean) and `customers` (array of customer objects)

**Throws:** Error with "Failed to fetch customers"

## Supplier Management

### createSupplier
Creates a new supplier record.

**Function:** `createSupplier(token, payload)`
**Endpoint:** `POST /api/suppliers`
**Authentication:** Required

**Parameters:**
- `token`: JWT authentication token
- `payload`: Object containing:
  - `Name`: Supplier name (string, required)
  - `phone_number`: Phone number (string, optional)
  - `email`: Email address (string, optional)

**Returns:** Promise that resolves to object with `batchId` (number)

**Throws:** Error with "Failed to create supplier"

### fetchSuppliers
Retrieves all suppliers for the authenticated user.

**Function:** `fetchSuppliers(token)`
**Endpoint:** `GET /api/suppliers`
**Authentication:** Required

**Parameters:**
- `token`: JWT authentication token

**Returns:** Promise that resolves to object with `success` (boolean) and `suppliers` (array of supplier objects)

**Throws:** Error with "Failed to fetch suppliers"

### linkSupplierProduct
Links a supplier to a specific product.

**Function:** `linkSupplierProduct(token, payload)`
**Endpoint:** `POST /api/suppliers/link`
**Authentication:** Required

**Parameters:**
- `token`: JWT authentication token
- `payload`: Object containing:
  - `supplierId`: Supplier ID (number, required)
  - `productId`: Product ID (number, required)

**Returns:** Promise that resolves to object with `success` (boolean) and optional `message` (string)

**Throws:** Error with "Failed to link supplier"

## Transaction Management

### createTransaction
Creates a new transaction (purchase or sale).

**Function:** `createTransaction(token, payload)`
**Endpoint:** `POST /api/transactions`
**Authentication:** Required

**Parameters:**
- `token`: JWT authentication token
- `payload`: Object containing:
  - `TransactionType`: Type of transaction - 'Purchase' or 'Sale' (string, required)
  - `payment_type`: Payment status - 'paid' or 'owed' (string, required)
  - `amount`: Transaction amount (number, required)
  - `SupplierID`: Supplier ID (number, optional, for purchases)
  - `CustomerID`: Customer ID (number, optional, for sales)
  - `TransactionDate`: Transaction date (string, required)

**Returns:** Promise that resolves to object with `batchId` (number)

**Throws:** Error with "Failed to create transaction"

### fetchTransactions
Retrieves transactions, optionally filtered by type.

**Function:** `fetchTransactions(token, type)`
**Endpoint:** `GET /api/transactions` or `GET /api/transactions?type={type}`
**Authentication:** Required

**Parameters:**
- `token`: JWT authentication token
- `type`: Filter by transaction type - 'Purchase' or 'Sale' (string, optional)

**Returns:** Promise that resolves to object with `success` (boolean) and `transactions` (array of transaction objects)

**Throws:** Error with "Failed to fetch transactions"

## Analytics

### fetchLowStockAlerts
Retrieves products with low stock levels.

**Function:** `fetchLowStockAlerts(token, threshold)`
**Endpoint:** `GET /api/analytics/low-stock?threshold={threshold}`
**Authentication:** Required

**Parameters:**
- `token`: JWT authentication token
- `threshold`: Stock level threshold for alerts (number, optional, default: 10)

**Returns:** Promise that resolves to object with `success` (boolean) and `lowStockAlerts` (array of low stock products)

**Throws:** Error with "Failed to fetch low stock alerts"

### fetchDailySales
Retrieves daily sales total for a specific date.

**Function:** `fetchDailySales(token, date)`
**Endpoint:** `GET /api/analytics/daily-sales` or `GET /api/analytics/daily-sales?date={date}`
**Authentication:** Required

**Parameters:**
- `token`: JWT authentication token
- `date`: Specific date to fetch sales for (string, optional)

**Returns:** Promise that resolves to object with `success` (boolean) and `dailySales` (number)

**Throws:** Error with "Failed to fetch daily sales"

## Type Definitions

### Authentication Types
- `LoginPayload`: Contains email and password for login
- `RegisterPayload`: Contains shopName, email, and password for registration
- `AuthResponse`: Contains token and optional error message

### Product Types
- `ProductPayload`: Data required to create a product
- `ProductResponse`: Data returned when fetching a product

### Inventory Types
- `InventoryBatchPayload`: Data for adding inventory batches
- `ReduceInventoryPayload`: Data for reducing inventory
- `StockLevelResponse`: Contains current stock level

### Customer Types
- `CustomerPayload`: Data for creating a customer
- `CustomerResponse`: Data returned when fetching a customer

### Supplier Types
- `SupplierPayload`: Data for creating a supplier
- `SupplierResponse`: Data returned when fetching a supplier
- `LinkSupplierPayload`: Data for linking suppliers to products

### Transaction Types
- `TransactionPayload`: Data for creating transactions
- `TransactionResponse`: Data returned when fetching transactions

### Analytics Types
- `LowStockAlert`: Contains low stock product information

### Response Types
- `BatchResponse`: Contains batch ID for created resources
- `SuccessResponse`: Standard success response
- `ErrorResponse`: Standard error response