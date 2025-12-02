# Inventrio

## Overview

**Inventrio** is a modern, robust business management application designed for small to medium-sized retail operations. It provides centralized control over product inventory, complex supplier relationships, and real-time financial tracking.

The application features a responsive, animated frontend built with **React** and **Styled Components**, backed by a secure **Node.js** architecture. A key architectural feature is its data isolation model: every user's business data is stored in a separate, dedicated SQLite database, ensuring data privacy and maximizing operational efficiency without complex multi-tenancy overhead.

## ✨ Features

### 📊 Dashboard & Analytics
* **Real-time Snapshot:** Instant view of critical business metrics including Total Products and Registered Suppliers.
* **Financial Performance:** Tracks **Sales** and **Stock Expenditure** over rolling windows (Last 24 Hours vs. Last 7/30 Days).
* **Low Stock Alerts:** Dedicated alert system for products falling below defined thresholds, ensuring timely replenishment.

### 📦 Inventory & Stock Management
* **Live Stock Tracking:** Visual indicators for stock levels with automatic "Low Stock" warning badges.
* **Purchase & Sales Flows:** Dedicated interfaces for:
    * **Purchasing Stock:** Adds inventory batches and automatically logs "Purchase" transactions (Expenses).
    * **Registering Sales:** Reduces inventory using **FIFO (First-In, First-Out)** logic and logs "Sale" transactions (Revenue).
* **Barcode Integration:** Supports rapid product lookup via barcode scanning during stock operations.

### 🤝 Supplier Relations
* **Partner Management:** Create and manage detailed supplier profiles.
* **Product Linking:** sophisticated Many-to-Many relationship management allowing users to link specific products to suppliers with custom pricing and lead times.

### 💰 Financials & Transactions
* **Comprehensive Ledger:** A detailed history of all financial movements, categorized by:
    * **Sale** (Revenue)
    * **Purchase** (Expense)
    * **Deposit** (Capital Injection)
    * **Withdrawal** (Owner Draw/Expense)
* **Cash Balance:** Real-time calculation of available cash flow based on transaction history.
* **Counter Transactions:** Built-in capability to create inverse transactions to correct errors or process refunds immediately.
* **Payment Status:** Tracks whether transactions are 'Paid' or 'Owed'.

### 🎨 Modern User Experience
* **Inventrio Design System:** A cohesive UI featuring a primary Indigo theme, glassmorphism effects, and consistent iconography.
* **Responsive Design:** Fully optimized layouts that adapt from Desktop data tables to Mobile-friendly stacks.
* **Smooth Animations:** Features sliding navigation pills, animated modals, and page transitions for a premium feel.

## 💾 Database Architecture

Inventrio employs a dual-database structure to ensure strong user data isolation while maintaining a single authentication layer.

1.  **Main Database (`users.db`):**
    * **Purpose:** Stores global authentication data (email, hashed passwords) and the unique identifier (`folder_hash`) needed to locate a user's isolated business database.
    * **Tables:** `users`.

2.  **Isolated User Database (`data/{folder_hash}/user.db`):**
    * **Purpose:** Contains all business-specific operations, separated entirely from other users' data.
    * **Tables:**
        * `products` (Global product definitions)
        * `inventory` (Batch-specific stock data)
        * `suppliers` & `customers` (CRM data)
        * `supplier_products` & `supplier_product_pricing` (Linking & Cost logic)
        * `transactions` (Financial ledger)
        * `StockMovement` (Audit trail)

## 🛠️ Technology Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React | Component-based UI library for building the interactive dashboard. |
| **Styling** | Styled Components | CSS-in-JS library used for theming, dynamic styles, and animations. |
| **Backend** | Node.js | Runtime environment for the server logic. |
| **Database** | SQLite3 | Lightweight, file-based database used for simple, embedded data storage and per-user isolation. |
| **Language** | TypeScript | Provides static typing across both Frontend and Backend for code safety. |
| **API** | Express / Axios | RESTful API communication between client and server. |