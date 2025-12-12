## 1. Main View (`ManageSupplyers.tsx`)

The main view serves as the directory for all external partners. It handles data aggregation, combining basic supplier details with their specific product catalogs.

### A. Layout & Structure
* **Header:** Displays the title "Suppliers" and the primary action button "Register New Supplier".
* **Supplier List Card:**
    * The core content is wrapped in a styled `Card` component with a header icon (`TbBuildingStore`).
    * **Empty State:** If no suppliers exist, an illustrated empty state prompts the user to add their first partner.
    * **List Items:** Rendered using the `SupplyerItem` component.

### B. Data Aggregation Strategy
Unlike other modules that fetch a single resource, this module performs a composite fetch to provide immediate context on the list view.
1.  **Fetch Suppliers:** Calls `fetchSuppliers` to get the base list.
2.  **Enrichment:** Iterates through the result and calls `fetchSupplierProducts` for *each* supplier.
3.  **Result:** The state `suppliers` stores a composite object (`SupplierWithProducts`) containing both the profile and the array of linked products.

### C. List Item Component (`SupplyerItem.tsx`)
Each row in the list displays a snapshot of the partner:
* **Columns:**
    * *Index:* Visual counter.
    * *Identity:* Supplier Name and a calculated count of linked products (e.g., "3 Products Linked").
    * *Contact:* Email and Phone number (hidden on mobile devices).
* **Actions:**
    * *Edit:* Opens the detailed `EditSupplyer` view.
    * *Delete:* Triggers a `ConfirmModal`. On confirmation, the removal logic executes in the parent controller.

---

## 2. Registration Workflow (`AddSupplyer.tsx`)

Clicking "Register New Supplier" opens a modal overlay focused on capturing essential contact details.

* **Modal Behavior:** The modal is dismissible via the "Esc" key or the close icon. It uses a backdrop blur for focus.
* **Form Validation:**
    * **Name:** Must be at least 4 characters.
    * **Phone:** Input is masked to allow only digits and must be exactly 10 digits.
    * **Email:** Validated against a standard regex pattern.
* **Submission:** Valid data triggers a secondary confirmation modal ("Confirm Supplier") before the API call is made.

---

## 3. Editing & Product Linking (`EditSupplyer.tsx`)

Selecting "Edit" on a supplier replaces the main view with the `EditSupplyer` component. This view utilizes a **Split-Pane Layout** to manage the relationship complexity.

### A. Left Pane: Profile Management
This section handles the supplier's core identity.
* **Fields:** Editable inputs for Name, Email, and Phone Number.
* **Actions:**
    * *Save Changes:* Updates the supplier record via `updateSupplier`.
    * *Delete:* Removes the supplier and cascades the deletion to unlink all associated products.

### B. Right Pane: Product Offerings
This section manages the "Catalogue" specific to this supplier using the `ProductLinkerComponent`.

* **Product List:**
    * Displays cards for every product provided by this supplier.
    * Shows supplier-specific metadata: `Price`, `SKU`, and `Lead Time`.
    * **Unlink Action:** Allows removing a product from this supplier's offering without deleting the product itself from the system.
* **Link New Product Flow (`LinkProduct.tsx`):**
    * Triggered by the "Add Product" button.
    * **Selection:** A dropdown lists all defined products in the system.
    * **Pricing:** Users must define the `Supplier Price` and optional `Supplier SKU` specific to this relationship.
    * **Logic:** Executes both `linkSupplierProduct` (to create the relationship) and `updateSupplierPricing` (to set the cost) in sequence.