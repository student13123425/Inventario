## 1. Main View (`ManageInventory.tsx`)

The main view serves as the central dashboard for stock control, displaying current levels and providing access to stock movement actions.

### A. Layout & Structure
* **Header:** Displays the title "Inventory Management" and the primary action buttons:
    * **Purchase Stock (In):** Opens the purchase workflow.
    * **Register Sale (Out):** Opens the sales workflow.
* **Stock List Card:**
    * The list is wrapped in a styled container.
    * **Empty State:** If the product registry is empty, it prompts the user to define products in the *Product Catalogue* before managing stock.
    * **List Items:** Rendered using the `InventoryItem` component.
* **View Switching:** The component manages a local `viewState` ('list', 'buy', 'sell') to toggle between the main list and the operational modals.

---

## 2. Stock Item Component (`InventoryItem.tsx`)

Each row in the list represents the stock status of a specific product. Unlike the static Product Catalogue, this component fetches dynamic quantity data.

### A. Data Fetching & Logic
* **Per-Item Fetching:** On mount, each item triggers `fetchStockLevel` to get the current quantity for its specific Product ID.
* **Low Stock Logic:** A boolean `isLowStock` is calculated locally. If the `stockLevel` drops below **10 units**, the system flags the item.

### B. Visual Presentation
* **Grid Layout:** Uses a responsive grid that hides the "Sell Price" and "Origin" columns on mobile devices (`max-width: 768px`).
* **Columns:**
    * *Identity:* Displays Product Name and a monospaced Barcode badge.
    * *Price:* Formatted as USD currency.
    * *Stock Level:* Displays the numeric quantity.
        * **Alert:** If `isLowStock` is true, a red "Low" warning badge with an alert icon (`TbAlertTriangle`) appears next to the quantity.

---

## 3. Stock Operations

The module includes two dedicated workflows for modifying stock levels, both implemented as full-screen overlays.

### A. Register Sale (Outgoing) - (`SellStock.tsx`)
This workflow handles selling items to the public, decreasing inventory and recording revenue.

* **Search & Selection:**
    * Users can search for products by **Name** or **Barcode**.
    * Selecting a product displays a summary box calculating the `Total Revenue` (Price × Quantity).
* **Execution Logic:**
    * **Reduce Inventory:** Calls `reduceInventory` API to decrement stock.
    * **Record Transaction:** Simultaneously calls `createTransaction` with:
        * `TransactionType`: 'Sale'
        * `amount`: Calculated positive revenue.
        * `payment_type`: 'paid' (Immediate payment).

### B. Purchase Stock (Incoming) - (`PurchaseStock.tsx`)
This workflow handles receiving goods from suppliers, increasing inventory and recording costs.

* **Supplier-First Flow:**
    1.  **Select Supplier:** The user must first select a supplier from the active registry.
    2.  **Select Product:** The product dropdown is dynamically filtered to show only items linked to the selected supplier.
* **Cost Calculation:**
    * Displays the `Supplier Price` (Cost) for the selected item.
    * A summary box calculates `Total Cost` (Supplier Price × Quantity).
* **Execution Logic:**
    * **Add Inventory:** Calls `addInventoryBatch` to increment stock.
    * **Record Transaction:** Simultaneously calls `createTransaction` with:
        * `TransactionType`: 'Purchase'
        * `amount`: Calculated cost.
        * `SupplierID`: Links the financial record to the specific partner.