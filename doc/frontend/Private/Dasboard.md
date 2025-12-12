## 1. Overview and Layout

The Dashboard is designed as a responsive grid that adjusts based on the viewport width.

* **Page Container:** Wraps the content with padding and a light gray background (`#f9fafb`).
* **Header:** Displays the title "Dashboard Overview" and a subtitle describing the page's purpose.
* **Grid Layout:**
    * **Desktop:** A two-column layout where the left column (Metrics) takes up 2/3 of the space (`2fr`) and the right column (Alerts) takes up 1/3 (`1fr`).
    * **Mobile/Tablet:** A single-column stacked layout triggers on screens smaller than 1024px.

## 2. Key Components

### A. Metrics Grid (Left Column)
The left column contains the `MetricsGrid`, which utilizes a responsive grid layout (`repeat(auto-fit, minmax(240px, 1fr))`) to organize summary cards.

The grid displays six distinct Key Performance Indicators (KPIs):
1.  **Total Products:** The count of active items in the inventory.
2.  **Total Suppliers:** The number of registered external partners.
3.  **Sales (24h):** Revenue generated from sales in the last 24 hours.
4.  **Sales (7 Days):** Revenue generated from sales in the last 7 days.
5.  **Stock Bought (24h):** Expenditure on new stock in the last 24 hours.
6.  **Stock Bought (30d):** Expenditure on new stock in the last 30 days.

**Visual Styling:**
Each metric is presented in a `MetricCard` with a white background, subtle border, and shadow. On hover, the card lifts (`translateY(-2px)`) and the shadow deepens.

### B. Stock Alerts Panel (Right Column)
The right column is dedicated to the `RightCard` component, which serves specifically as the **Stock Alerts** monitor.

* **Structure:** A fixed-height container (`min-height: 30rem`, `max-height: 45rem`) that allows internal scrolling for the content area.
* **Header Badge:** If alerts exist, a red pill badge displays the count of items (e.g., "5 Items").
* **Alert Items:** Individual alerts are rendered using the `StockAlertItem` component. Each row displays:
    * **Index ID:** A blue badge showing the row number.
    * **Name:** The product name, truncated with an ellipsis if too long.
    * **Quantity Badge:** A red badge indicating the remaining stock (e.g., "3 left").

**Empty State:**
If the `LowStockAlerts` array is empty, the card displays an "EmptyContainer" featuring a large green checkmark icon (`AiOutlineCheckCircle`) and the text: *"Inventory levels are healthy. No low stock alerts."*.

## 3. Data Logic & Aggregation

The Dashboard fetches data from four distinct API endpoints upon mounting using `useEffect`.

### Data Sources
* **Products:** Fetches the full product list to calculate the count.
* **Suppliers:** Fetches the supplier registry to calculate the count.
* **Transactions (Sales):** Fetches transactions of type 'Sale'.
* **Transactions (Purchases):** Fetches transactions of type 'Purchase'.
* **Low Stock Alerts:** Fetches specific items flagged as low stock.

### Client-Side Calculations
Financial metrics are calculated client-side by iterating through transaction arrays:

* **Sales Calculation:** The helper function `salesLast24hAnd7d` filters transactions by the 'Sale' type and timestamps to sum totals for the 24-hour and 7-day windows.
* **Purchase Calculation:** The helper function `stockBoughtLast24hAnd30d` filters transactions by the 'Purchase' type to sum totals for the 24-hour and 30-day windows.
* **Currency Formatting:** All monetary values are formatted using `Intl.NumberFormat` for USD.

## 4. Loading & Error States

* **Loading:** The component tracks the state of all six data points. If any are `null`, a `LoadingComponent` is displayed with the message "Loading dashboard data...".
* **Error Handling:** The `DashBoard` component accepts a `setError` function prop. If any API call fails (Products, Suppliers, Sales, Purchases, or Alerts), an error message is passed back to the parent controller.