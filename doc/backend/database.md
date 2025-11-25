# Database Documentation

## Overview

This system uses two SQLite databases to manage user authentication and per-user business data. The main database (`users.db`) handles user accounts, while each user has their own isolated database (`user.db`) for business operations.

## Main Database (users.db)

### Connection & Initialization

The main database is located at the project root as `users.db` and is automatically initialized when the application starts.

### Users Table

Stores user authentication and account information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique user identifier |
| shop_name | TEXT | NOT NULL | Name of the user's shop/business |
| email | TEXT | UNIQUE, NOT NULL | User's email address (login credential) |
| password_hash | TEXT | NOT NULL | Hashed password for authentication |
| folder_hash | TEXT | UNIQUE, NOT NULL | Unique identifier for user's data directory |

## User Database (user.db)

Each user has their own SQLite database stored in `data/{folder_hash}/user.db` that manages their business operations.

### Database Schema

#### Products Table
Stores product master data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| ID | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique product identifier |
| name | TEXT | NOT NULL | Product name |
| price | REAL | NOT NULL | Selling price |
| nation_of_origin | TEXT | - | Country of origin |
| product_bar_code | TEXT | UNIQUE | Barcode identifier |
| expiration_date | INTEGER | - | Product expiration date |

#### Inventory Table
Tracks inventory batches and pricing.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| OrderID | INTEGER | PRIMARY KEY AUTOINCREMENT | Batch identifier |
| ProductID | INTEGER | NOT NULL | References products(ID) |
| purchase_price | REAL | NOT NULL | Cost price per unit |
| sale_price | REAL | NOT NULL | Selling price per unit |
| quantity | INTEGER | NOT NULL | Current stock quantity |
| expiration_date_per_batch | TEXT | - | Batch-specific expiration |

#### Suppliers Table
Stores supplier information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| ID | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique supplier identifier |
| Name | TEXT | NOT NULL | Supplier name |
| phone_number | TEXT | - | Contact number |
| email | TEXT | - | Contact email |

#### Supplier_Products Table
Many-to-many relationship between suppliers and products.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| SupplierID | INTEGER | PRIMARY KEY, FOREIGN KEY | References suppliers(ID) |
| ProductID | INTEGER | PRIMARY KEY, FOREIGN KEY | References products(ID) |

#### Customers Table
Stores customer information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| ID | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique customer identifier |
| name | TEXT | NOT NULL | Customer name |
| phone_number | TEXT | - | Contact number |
| email | TEXT | - | Contact email |

#### Transactions Table
Records financial transactions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| ID | INTEGER | PRIMARY KEY AUTOINCREMENT | Transaction identifier |
| TransactionType | TEXT | NOT NULL, CHECK | 'Purchase' or 'Sale' |
| payment_type | TEXT | NOT NULL, CHECK | 'paid' or 'owed' |
| amount | REAL | NOT NULL | Transaction amount |
| SupplierID | INTEGER | FOREIGN KEY | References suppliers(ID) |
| CustomerID | INTEGER | FOREIGN KEY | References customers(ID) |
| TransactionDate | TEXT | NOT NULL | Transaction timestamp |

#### StockMovement Table
Tracks inventory movements.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| ID | INTEGER | PRIMARY KEY AUTOINCREMENT | Movement identifier |
| movement_type | TEXT | NOT NULL, CHECK | 'In' or 'Out' |
| Quantity | INTEGER | NOT NULL | Quantity moved |
| MovementDate | TEXT | NOT NULL | Movement timestamp |
| InventoryID | INTEGER | NOT NULL, FOREIGN KEY | References inventory(OrderID) |

## Directory Structure

```
project-root/
├── users.db (main database)
├── data/
│   └── {folder_hash}/
│       ├── user.db (user's business database)
│       └── images/ (user's product images)
```