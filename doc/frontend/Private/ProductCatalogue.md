## 1. Main View (`ProductCatalogue.tsx`)

The main view provides a searchable list of all defined products. It handles the retrieval and display of product definitions.

### A. Layout & Structure
* **Header:** Displays the title "Product Catalogue" and a subtitle. It houses the primary action button "Add New Product".
* **Product List Card:**
    * The content is wrapped in a styled `Card` component with a header icon (`TbPackage`).
    * **Empty State:** If the catalogue is empty, a specific `EmptyState` component displays a cross-circle icon (`FaTimesCircle`) and a prompt to add the first product.
    * **List Items:** Rendered using the `ProductItem` component.

### B. Data Logic
* **Fetching:** On component mount, the `getProducts` function is called. It retrieves the full list of products via the `fetchProducts` API endpoint using the authentication token.
* **Loading State:** While data is being fetched, a `LoadingComponent` blocks the view.
* **Error Handling:** If the fetch fails, an error message is propagated up to the parent controller via the `setError` prop.

### C. List Item Component (`ProductItem.tsx`)
Each row represents a single product definition.
* **Responsive Layout:** The grid adapts to screen size (`grid-template-columns`), hiding less critical details like "Nation of Origin" on mobile devices.
* **Columns:**
    * *Index:* A visual counter in a blue box.
    * *Identity:* Displays the Product Name and a gray badge containing the Barcode.
    * *Price:* Formatted as USD currency (e.g., "$10.00").
    * *Details:* Shows the Barcode and Nation of Origin.
* **Actions:**
    * *Edit:* Opens the `EditProduct` view.
    * *Delete:* Triggers a `ConfirmModal` to prevent accidental removal.

---

## 2. Product Creation (`AddProduct.tsx`)

Clicking "Add New Product" opens a dedicated modal overlay for defining new item metadata.

* **Modal Structure:** A fixed overlay with a centered card. It includes a header with a "Back" button and a "Close" icon.
* **Form Fields:**
    * **Name:** Required text field.
    * **Price:** Required number field; must be positive.
    * **Barcode:** Required text field for scanning or manual entry.
    * **Nation of Origin:** Required text field; validated against a helper function `isNation`.
    * **Expiration Date:** Optional date picker.
* **Validation:** Custom validation logic ensures no required fields are empty and prices are valid numbers. Errors are displayed inline below specific fields.
* **Keyboard Support:** The "Escape" key can be used to close the modal or cancel the confirmation dialog.

---

## 3. Editing & Supplier Sourcing (`EditProduct.tsx`)

The `EditProduct` component replaces the main view when a user selects an item to edit. It uses a **Split-Pane Layout** to separate product metadata from supply chain relationships.

### A. Left Pane: Product Metadata
This section allows modification of the item's core definitions.
* **Fields:** Editable inputs for Name, Sale Price, Barcode, Nation of Origin, and Expiration Date.
* **Actions:**
    * *Save Changes:* Updates the product via `onUpdate`.
    * *Delete:* Permanently removes the product from the catalogue.

### B. Right Pane: Supplier Sourcing (`SupplierLinkerComponent.tsx`)
This section manages the "Sourcing" aspect, defining which suppliers provide this specific product.

* **Supplier List:**
    * Displays cards for every supplier linked to this product.
    * Shows sourcing-specific data: `Cost`, `Lead Time`, and `Min Order Quantity`.
    * **Unlink Action:** Allows removing a supplier source without deleting the supplier itself.
* **Link New Supplier Flow (`LinkSupplier.tsx`):**
    * Triggered by the "Link Supplier" button.
    * **Selection:** A dropdown lists all active suppliers.
    * **Costing:** Users must define the `Supplier Price` and optional `Supplier SKU` for this specific product-supplier relationship.
    * **Execution:** Calls `linkSupplierProduct` to establish the link and immediately follows with `updateSupplierPricing` to ensure cost data is accurate.