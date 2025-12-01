# API Documentation

## Overview

Base URL: `http://localhost:3000`

### Authentication
- Uses JWT tokens for authentication
- Tokens must be included in the `Authorization` header as: `Bearer <token>`
- Protected routes require valid authentication
- Tokens expire after 90 days

### Statistics Collection
- Automatic statistics collection every 6 hours
- Statistics saved to `./stats.json` file
- Manual collection triggers available
- Both public and protected statistics endpoints available

### Error Responses
All error responses follow a consistent format with success flag and error message.

## Authentication Endpoints

### Register New User
Creates a new user account and returns an authentication token.

- **URL**: `/api/register`
- **Method**: `POST`
- **Authentication**: None required

**Required Fields:**
- shopName: String (business/shop name)
- email: String (valid email address)
- password: String (minimum security requirements apply)

**Success Response:**
- **Code:** 201 - User created successfully
- **Content:** JWT token for immediate authentication

**Error Responses:**
- **Code:** 400 - Missing required fields
- **Code:** 409 - Email already registered
- **Code:** 500 - Server error during registration

### User Login
Authenticates a user and returns an authentication token.

- **URL**: `/api/login`
- **Method**: `POST`
- **Authentication**: None required

**Required Fields:**
- email: String (registered email address)
- password: String (matching password)

**Success Response:**
- **Code:** 200 - Login successful
- **Content:** JWT token for protected endpoints

**Error Responses:**
- **Code:** 400 - Missing required fields
- **Code:** 401 - Invalid credentials (wrong email or password)
- **Code:** 500 - Server error during login

### Token Verification
Validates the current authentication token.

- **URL**: `/api/check-token`
- **Method**: `GET`
- **Authentication**: Token required

**Success Response:**
- **Code:** 200 - Token is valid
- **Content:** Current user information including ID, email, and shop name

## Public Statistics Endpoints (No Authentication Required)

### Get All Statistics
Retrieves the complete statistics data collected from all users.

- **URL**: `/api/public/stats`
- **Method**: `GET`
- **Authentication**: None required

**Response Includes:**
- Timestamp of last collection
- Total number of users in system
- Complete analytics data for each user
- System-wide aggregation of business metrics

**Error Responses:**
- **Code:** 500 - Statistics file read error or server error

### Manually Trigger Statistics Collection
Manually triggers the statistics collection process.

- **URL**: `/api/public/stats/collect`
- **Method**: `POST`
- **Authentication**: None required

**Success Response:**
- **Code:** 200 - Collection process started
- **Content:** Timestamp and confirmation message

**Note:** This endpoint initiates an asynchronous collection process that may take time depending on the number of users.

### Get Server Information
Retrieves server configuration and status information.

- **URL**: `/api/public/server-info`
- **Method**: `GET`
- **Authentication**: None required

**Response Includes:**
- Server name and version
- Current timestamp
- Statistics collection configuration
- Endpoint map (available API routes)
- File system status for statistics storage

## Product Management Endpoints (Protected)

### Create Product
Creates a new product in the inventory system.

- **URL**: `/api/products`
- **Method**: `POST`
- **Authentication**: Token required

**Required Fields:**
- name: String (product name)
- price: Number (selling price)
- product_bar_code: String (unique barcode identifier)

**Optional Fields:**
- nation_of_origin: String
- expiration_date: Number

### Get All Products
Retrieves all products for the authenticated user's shop.

- **URL**: `/api/products`
- **Method**: `GET`
- **Authentication**: Token required

### Get Product by Barcode
Retrieves a specific product by its barcode.

- **URL**: `/api/products/barcode/:barcode`
- **Method**: `GET`
- **Authentication**: Token required

### Update Product
Updates an existing product's information.

- **URL**: `/api/products/:id`
- **Method**: `PUT`
- **Authentication**: Token required

### Delete Product
Removes a product from the system.

- **URL**: `/api/products/:id`
- **Method**: `DELETE`
- **Authentication**: Token required

## Inventory Management Endpoints (Protected)

### Add Inventory Batch
Adds a new batch of inventory for a specific product.

- **URL**: `/api/inventory`
- **Method**: `POST`
- **Authentication**: Token required

**Required Fields:**
- ProductID: Number (existing product ID)
- purchase_price: Number (cost price)
- sale_price: Number (selling price)
- quantity: Number (items in batch)

**Optional Fields:**
- expiration_date_per_batch: String (date format)

### Update Inventory Batch
Modifies an existing inventory batch.

- **URL**: `/api/inventory/:id`
- **Method**: `PUT`
- **Authentication**: Token required

### Delete Inventory Batch
Removes an inventory batch.

- **URL**: `/api/inventory/:id`
- **Method**: `DELETE`
- **Authentication**: Token required

### Get Stock Level
Retrieves current stock quantity for a specific product.

- **URL**: `/api/inventory/stock-level/:productId`
- **Method**: `GET`
- **Authentication**: Token required

### Reduce Inventory (FIFO)
Reduces inventory using First-In-First-Out method.

- **URL**: `/api/inventory/reduce`
- **Method**: `POST`
- **Authentication**: Token required

## Customer Management Endpoints (Protected)

### Create Customer
Adds a new customer to the system.

- **URL**: `/api/customers`
- **Method**: `POST`
- **Authentication**: Token required

**Required Fields:**
- name: String (customer name)

**Optional Fields:**
- phone_number: String
- email: String

### Get All Customers
Retrieves all customers for the authenticated user.

- **URL**: `/api/customers`
- **Method**: `GET`
- **Authentication**: Token required

### Update Customer
Modifies customer information.

- **URL**: `/api/customers/:id`
- **Method**: `PUT`
- **Authentication**: Token required

### Delete Customer
Removes a customer from the system.

- **URL**: `/api/customers/:id`
- **Method**: `DELETE`
- **Authentication**: Token required

### Get Customer Transactions
Retrieves all transactions for a specific customer.

- **URL**: `/api/customers/:id/transactions`
- **Method**: `GET`
- **Authentication**: Token required

## Supplier Management Endpoints (Protected)

### Create Supplier
Adds a new supplier to the system.

- **URL**: `/api/suppliers`
- **Method**: `POST`
- **Authentication**: Token required

**Required Fields:**
- Name: String (supplier name)

**Optional Fields:**
- phone_number: String
- email: String

### Get All Suppliers
Retrieves all suppliers for the authenticated user.

- **URL**: `/api/suppliers`
- **Method**: `GET`
- **Authentication**: Token required

### Update Supplier
Modifies supplier information.

- **URL**: `/api/suppliers/:id`
- **Method**: `PUT`
- **Authentication**: Token required

### Delete Supplier
Removes a supplier from the system.

- **URL**: `/api/suppliers/:id`
- **Method**: `DELETE`
- **Authentication**: Token required

### Link Supplier to Product
Creates a relationship between a supplier and a product.

- **URL**: `/api/suppliers/link`
- **Method**: `POST`
- **Authentication**: Token required

**Required Fields:**
- supplier_id: Number
- product_id: Number
- supplier_price: Number

**Optional Fields:**
- supplier_sku: String
- min_order_quantity: Number
- lead_time_days: Number
- is_active: Boolean

### Unlink Supplier from Product
Removes the relationship between a supplier and product.

- **URL**: `/api/suppliers/:supplierId/products/:productId`
- **Method**: `DELETE`
- **Authentication**: Token required

### Get Supplier Products
Retrieves all products supplied by a specific supplier.

- **URL**: `/api/suppliers/:id/products`
- **Method**: `GET`
- **Authentication**: Token required

### Get Product Suppliers
Retrieves all suppliers for a specific product.

- **URL**: `/api/products/:id/suppliers`
- **Method**: `GET`
- **Authentication**: Token required

### Get Supplier Transactions
Retrieves all transactions with a specific supplier.

- **URL**: `/api/suppliers/:id/transactions`
- **Method**: `GET`
- **Authentication**: Token required

## Transaction Management Endpoints (Protected)

### Create Transaction
Records a new financial transaction.

- **URL**: `/api/transactions`
- **Method**: `POST`
- **Authentication**: Token required

**Required Fields:**
- TransactionType: String ('Purchase' or 'Sale')
- payment_type: String ('paid' or 'owed')
- amount: Number
- TransactionDate: String (date format)

**Optional Fields:**
- SupplierID: Number (for purchases)
- CustomerID: Number (for sales)
- notes: String

### Get Transaction History
Retrieves transaction history with optional filtering.

- **URL**: `/api/transactions`
- **Method**: `GET`
- **Authentication**: Token required

**Query Parameters:**
- type: String (optional, 'Purchase' or 'Sale')

### Update Transaction
Modifies an existing transaction.

- **URL**: `/api/transactions/:id`
- **Method**: `PUT`
- **Authentication**: Token required

### Delete Transaction
Removes a transaction from the system.

- **URL**: `/api/transactions/:id`
- **Method**: `DELETE`
- **Authentication**: Token required

## Advanced Analytics Endpoints (Protected)

### Complete Analytics Report
Retrieves comprehensive analytics for the authenticated user.

- **URL**: `/api/analytics/complete`
- **Method**: `GET`
- **Authentication**: Token required

**Includes:**
- Sales trends over time
- Top performing products
- Inventory turnover rates
- Profit margin analysis
- Customer lifetime value
- Supplier performance metrics
- Inventory valuation
- Payment analysis

### Quick Dashboard
Retrieves key performance indicators for immediate overview.

- **URL**: `/api/analytics/dashboard`
- **Method**: `GET`
- **Authentication**: Token required

**Includes:**
- Total inventory value
- Today's sales total
- Low stock count and alerts
- Outstanding balance

### Sales Trends Analysis
Analyzes sales patterns over time periods.

- **URL**: `/api/analytics/sales-trends`
- **Method**: `GET`
- **Authentication**: Token required

**Query Parameters:**
- period: String ('daily', 'weekly', or 'monthly')
- startDate: String (date format)
- endDate: String (date format)

### Top Products Analysis
Identifies best-selling products.

- **URL**: `/api/analytics/top-products`
- **Method**: `GET`
- **Authentication**: Token required

**Query Parameters:**
- limit: Number (default: 10)
- startDate: String (optional)
- endDate: String (optional)

### Inventory Turnover Analysis
Calculates inventory turnover rates.

- **URL**: `/api/analytics/inventory-turnover`
- **Method**: `GET`
- **Authentication**: Token required

**Query Parameters:**
- productId: Number (optional, for specific product)

### Profit Margin Analysis
Calculates profit margins for specified periods.

- **URL**: `/api/analytics/profit-margin`
- **Method**: `GET`
- **Authentication**: Token required

**Query Parameters:**
- startDate: String (date format)
- endDate: String (date format)

### Customer Lifetime Value
Analyzes customer value over time.

- **URL**: `/api/analytics/customer-lifetime-value`
- **Method**: `GET`
- **Authentication**: Token required

### Supplier Performance
Evaluates supplier reliability and performance.

- **URL**: `/api/analytics/supplier-performance`
- **Method**: `GET`
- **Authentication**: Token required

### Inventory Valuation
Calculates current inventory value.

- **URL**: `/api/analytics/inventory-valuation`
- **Method**: `GET`
- **Authentication**: Token required

### Payment Analysis
Analyzes payment patterns and outstanding balances.

- **URL**: `/api/analytics/payment-analysis`
- **Method**: `GET`
- **Authentication**: Token required

### Low Stock Alerts
Identifies products below specified threshold.

- **URL**: `/api/analytics/low-stock`
- **Method**: `GET`
- **Authentication**: Token required

**Query Parameters:**
- threshold: Number (default: 10)

### Daily Sales Total
Retrieves sales total for a specific date.

- **URL**: `/api/analytics/daily-sales`
- **Method**: `GET`
- **Authentication**: Token required

**Query Parameters:**
- date: String (date format, default: current date)

## Admin Statistics Management Endpoints (Protected)

### Manual Statistics Save
Manually triggers statistics collection (admin).

- **URL**: `/api/admin/save-stats`
- **Method**: `POST`
- **Authentication**: Token required

### Stop Statistics Collection
Stops automatic statistics collection (admin).

- **URL**: `/api/admin/stop-stats-collection`
- **Method**: `POST`
- **Authentication**: Token required

### Start Statistics Collection
Starts automatic statistics collection (admin).

- **URL**: `/api/admin/start-stats-collection`
- **Method**: `POST`
- **Authentication**: Token required

**Request Body (Optional):**
- intervalHours: Number (default: 6)

## System Information

### Server Configuration
- **Port:** 3000
- **CORS:** Enabled for all origins
- **Body Parser:** JSON format support
- **Database:** SQLite with automatic initialization
- **Statistics:** Auto-save every 6 hours

### Statistics File
- **Location:** `./stats.json` (project root)
- **Format:** JSON with timestamp and user analytics
- **Auto-generation:** Created on first statistics collection
- **Access:** Public endpoint available

### Graceful Shutdown
- Handles SIGINT and SIGTERM signals
- Stops statistics collection on shutdown
- Clean database connection closure

## Error Handling

### Standard Error Format
All error responses include success flag and error message.

### Common HTTP Status Codes
- **200:** Success
- **201:** Resource created
- **400:** Bad request (missing/invalid parameters)
- **401:** Unauthorized (invalid/missing token)
- **403:** Forbidden (resource access denied)
- **404:** Endpoint not found
- **409:** Conflict (duplicate resource)
- **500:** Internal server error

### Global Error Handler
Catches all unhandled errors and returns standardized 500 responses.

### 404 Handler
Returns custom 404 response for undefined routes with requested URL and method information.

## Security Notes

### Current Implementation
- Public statistics endpoints are currently open (no authentication)
- All business data endpoints require JWT authentication
- Token-based authorization for resource access
- Database isolation per user with folder hash system

### Recommended Enhancements
- API key authentication for public statistics endpoints
- Rate limiting for public endpoints
- IP whitelisting for admin functions
- HTTPS enforcement in production
- Regular token rotation implementation

## Data Types and Structures

### User Object (Authentication)
Contains user identification and business information for authenticated sessions.

### Analytics Objects
Comprehensive data structures for business intelligence including:
- Sales trend data with period aggregation
- Product performance metrics
- Inventory valuation calculations
- Customer value analysis
- Supplier performance ratings
- Financial margin calculations

### Statistics Summary
System-wide aggregation of all user analytics with timestamp and total user count.

## System Requirements

### Prerequisites
- Node.js runtime environment
- SQLite database system
- File system write permissions for statistics storage

### Storage Requirements
- User database files in `./data/` directory
- Statistics file at `./stats.json`
- Image storage in user-specific directories

### Performance Notes
- Statistics collection runs asynchronously
- Large user bases may increase collection time
- Database operations optimized with transactions
- Analytics queries designed for efficiency