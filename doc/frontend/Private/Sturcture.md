## 1. Structural Overview
The private interface is built as a single-page application structure wrapped by a main layout controller. This controller manages the navigation state and renders the appropriate view based on the user's selection without refreshing the page.

The layout consists of two primary elements:
* **Global Navigation Bar:** A sticky, responsive top bar present on all views.
* **View Container:** The main content area that dynamically switches between five core modules: Dashboard, Manage Suppliers, Product Catalogue, Inventory Management, and Transactions.

---

## 2. Global Navigation
The application uses a persistent top navigation bar to facilitate movement between different modules.

### Desktop View
On larger screens, the navigation bar displays the application logo on the left, a central pill-shaped menu for module selection, and user actions on the right.

* **Module Links:** The central menu contains links to the five core modules. An active state indicator (a sliding pill background) highlights the currently selected module.
* **User Actions:** A "Sign out" button is located on the far right. Clicking this triggers a confirmation modal to prevent accidental logouts.

### Mobile View
On smaller devices (tablets and mobile phones), the desktop menu is hidden and replaced by a "Hamburger" menu icon.

* **Dropdown Menu:** Clicking the icon reveals a vertical list of navigation links and the sign-out option.
* **Overlay:** A dimmed background overlay appears behind the menu; clicking it closes the mobile menu.

---

## 3. Core Modules

### A. Dashboard
The Dashboard serves as the landing page and provides a high-level operational overview. It is divided into a responsive grid layout:

* **Metrics Grid (Left Column):** A collection of summary cards displaying real-time key performance indicators (KPIs), including:
    * *Total Products:* The count of active items defined in the system.
    * *Total Suppliers:* The number of registered external partners.
    * *Sales Performance:* Revenue figures for the last 24 hours and the last 7 days.
    * *Expenditure:* Stock purchase costs for the last 24 hours and the last 30 days.
* **Alerts Panel (Right Column):** A dedicated section for actionable insights, specifically displaying "Low Stock" alerts to prompt immediate reordering.

### B. Manage Suppliers
This module focuses on supply chain relationship management.

* **Supplier List:** The main view displays a card containing a list of all registered suppliers.
* **Registration:** A "Register New Supplier" button allows users to input details for new partners.
* **Management Actions:** Users can view detailed information for existing suppliers, including which products they provide. Specific flows exist for editing supplier details or removing them from the system.

### C. Product Catalogue
The Product Catalogue is the definitive registry of items the business trades. It defines what an item is, separate from how many are in stock.

* **Product Registry:** A list view displaying all products currently defined in the system.
* **Creation Flow:** An "Add New Product" action opens a form to define new item metadata (names, descriptions, pricing).
* **Editing & Deletion:** Existing products can be selected to update their details or remove them from the catalogue entirely.
* **Empty State:** If the catalogue is empty, the interface guides the user to create their first product.

### D. Inventory Management
This module handles the physical flow of goods. Unlike the Product Catalogue (which defines items), this section tracks quantities and movements.

* **Stock Levels:** The primary view lists current stock quantities for all items.
* **Operational Actions:** Two primary buttons sit at the top of the view:
    * *Purchase Stock (In):* Triggers a workflow to record incoming inventory from suppliers, increasing stock counts.
    * *Register Sale (Out):* Triggers a workflow to record a sale to a customer, decreasing stock counts.
* **Logic:** The system handles the refreshing of the list automatically after a buy or sell operation completes.

### E. Transactions
The Transactions module acts as the financial ledger, recording the monetary side of all operations.

* **Cash Balance:** A summary card at the top displays the current calculated cash balance based on all recorded inflows and outflows.
* **Transaction Log:** A detailed table lists financial events. Each row displays:
    * *Date:* When the transaction occurred.
    * *Type:* Visual badges distinguish between Sales, Deposits, Purchases, and Withdrawals.
    * *Details:* Contextual information (e.g., Supplier Name for purchases, "Public Sale" for sales).
    * *Status:* Payment status (e.g., Paid).
    * *Amount:* The financial value, color-coded to indicate credit (green) or debit (red).
* **Counter-Transactions:** An action button on each row allows users to create a "Counter" transaction. This is useful for reversing errors or handling refunds by automatically pre-filling the inverse of the selected transaction.
* **Manual Entry:** A "New Transaction" button allows for manual recording of financial adjustments unrelated to inventory flow (e.g., deposits or withdrawals).

---

## 4. User Feedback & Loading States
The application utilizes a consistent design pattern for system status:

* **Loading Screens:** When fetching data (syncing inventory, loading financials), a full-screen or inline loading component appears with a pulsating animation and status message.
* **Empty States:** When a module has no data (e.g., no transactions found), the system displays a friendly illustration and a prompt telling the user how to get started.