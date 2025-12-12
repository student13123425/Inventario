## 1. Main View (`Transactions.tsx`)

The `Transactions` component is the primary interface for financial history. It aggregates data from transaction and supplier endpoints to present a unified ledger.

### A. Layout & Metrics
The view uses a responsive layout that adapts to screen size, hiding less critical columns on smaller devices.

* **Header Section:**
    * **Title/Subtitle:** Identifies the section and its purpose.
    * **Action Row:** Contains the "Cash Balance" card and the "New Transaction" button.
* **Cash Balance Calculation:**
    * **Logic:** The balance is calculated client-side using a `useMemo` hook to ensure performance.
    * **Formula:** It iterates through the transaction list.
        * *Exclusion:* Transactions with `payment_type === 'owed'` are excluded (as they represent credit/debt, not cash on hand).
        * *Addition:* `Sale` and `Deposit` types increase the balance.
        * *Deduction:* `Purchase` and `Withdrawal` types decrease the balance.
    * **Visuals:** The value is colored Green if positive and Red if negative.

### B. Transaction Ledger (Table)
The main content area is a styled table (`TableCard`) displaying the transaction history.

* **Data Fetching:** On mount, the component executes `Promise.all` to fetch both `fetchTransactions` and `fetchSuppliers`. This ensures supplier names are available for mapping against `SupplierID`s in the transaction list.
* **Sorting:** Transactions are sorted client-side by date (newest first).
* **Columns:**
    1.  **Date:** Formatted as "Mon DD, YYYY".
    2.  **Type:** A visual badge distinguishing the nature of the event:
        * *Sale / Deposit:* Green (`#059669`) background.
        * *Purchase:* Red (`#dc2626`) background.
        * *Withdrawal:* Orange (`#ea580c`) background.
    3.  **Details:** Contextual information based on type.
        * *Purchase:* Displays the Supplier Name (mapped from ID) or "General Expense" if no supplier is linked.
        * *Sale:* Displays "Public Sale".
        * *Other:* Displays "Operations Adjustment".
    4.  **Status:** Indicates if the transaction is `Paid` (Green) or `Owed` (Yellow).
    5.  **Amount:** Color-coded (Green/Red) with a `+` or `-` prefix.
    6.  **Action:** A "Counter" button allows for immediate reversal of transactions.

## 2. Transaction Creation & Management (`AddTransactionModal.tsx`)

The `AddTransactionModal` component handles both the creation of new manual transactions and the "Counter" workflow for correcting errors.

### A. Modes of Operation
1.  **New Transaction:**
    * Triggered by the "New Transaction" button on the main page.
    * Opens with empty fields, defaulting to "Sale" type and today's date.
2.  **Counter Transaction:**
    * Triggered by clicking "Counter" on a specific row in the ledger.
    * **Pre-filling Logic:** The modal receives `initialCounterData`. It automatically sets the Type, Payment Type, and Supplier to match the original transaction.
    * **Inverse Amount:** The amount field is pre-filled with the inverse of the original amount (`original * -1`) to facilitate a quick reversal or refund.

### B. Form Fields & Logic
* **Transaction Type:** A dropdown selecting between 'Sale', 'Purchase', 'Deposit', or 'Withdrawal'.
* **Supplier Selection:**
    * *Visibility:* Only appears if "Purchase" is selected.
    * *Component:* A custom styled dropdown (`DropdownWrapper`) that lists active suppliers fetched from the API. Allows linking the expense to a specific partner.
* **Payment Status:** A toggle for `Paid` (Immediate cash effect) vs `Owed` (Accounts Payable). This creates a distinction used in the Cash Balance calculation.
* **Amount:** Input field for the monetary value. In "Counter" mode, a helper text reminds users to "Enter a negative value to reverse transaction" if needed.

### C. Data Submission
Upon clicking "Create" or "Post Counter":
1.  A `TransactionPayload` object is constructed.
2.  If the type is not 'Purchase', the `SupplierID` is omitted.
3.  The `createTransaction` API endpoint is called.
4.  On success, the modal closes and triggers a refresh (`onSuccess` callback) of the main transaction list.