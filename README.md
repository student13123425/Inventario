# Inventario

## Overview

Inventario is a robust, single-user business management application designed for small to medium-sized retail operations. It provides centralized control over product inventory, supplier and customer relationship management (CRM), and real-time transaction tracking.

A key architectural feature of Inventario is its data isolation model: every user's business data is stored in a separate, dedicated SQLite database, ensuring data privacy and maximizing operational efficiency without complex multi-tenancy overhead.

## ✨ Features

### Dashboard & Analytics

* **Real-time Snapshot:** Instant view of critical business metrics upon login.

* **Low Stock Alerts:** Automatic notification for products falling below a defined threshold.

* **Daily Sales Summary:** Quick aggregation of daily financial performance.

### Inventory & Stock Management

* **Batch Tracking:** Manage inventory using distinct batches, allowing for specific purchase prices, sale prices, and crucial batch-specific expiration dates.

* **FIFO Stock Reduction:** Automated "First-In, First-Out" logic for sales to ensure products with the earliest expiration dates are sold first.

* **Stock Movement Audit:** Detailed tracking of all inventory movements ('In' for purchases, 'Out' for sales/spoilage).

### Point of Sale (POS) Terminal

* **Barcode Integration:** Rapid product lookup and retrieval using product barcodes.

* **Transaction Logging:** Detailed recording of all sales and purchases, including payment type ('paid' or 'owed').

### CRM & Financials

* **Unified People Management:** Dedicated modules for creating and managing Customer and Supplier details.

* **Transaction History:** Comprehensive ledger of all financial activity, filterable by date, type (Sale/Purchase), and customer/supplier.

## 💾 Database Architecture


Inventario employs a dual-database structure to ensure strong user data isolation while maintaining a single authentication layer.

1. **Main Database (`users.db`):**

   * **Purpose:** Stores global authentication data (email, hashed passwords) and the unique identifier (`folder_hash`) needed to locate a user's isolated business database.

   * **Tables:** `users`.

2. **Isolated User Database (`data/{folder_hash}/user.db`):**

   * **Purpose:** Contains all business-specific operations, separated entirely from other users' data.

   * **Tables:** `products`, `inventory`, `suppliers`, `customers`, `supplier_products`, `transactions`, and `StockMovement`.

## 🛠️ Technology Stack

| Category | Technology | Description | 
 | :--- | :--- | :--- | 
| **Backend** | Node.js | Runtime environment for the server logic. | 
| **Database** | SQLite3 | Lightweight, file-based database used for simple, embedded data storage and per-user isolation. | 
| **Language** | TypeScript | Provides static typing for improved code quality and maintainability. | 
| **Framework** | Express (or similar) | Used for building the RESTful API endpoints (implicit based on server structure). |  