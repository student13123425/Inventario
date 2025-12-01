export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  shopName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  error?: string;
}

export interface ProductPayload {
  name: string;
  price: number;
  nation_of_origin?: string;
  product_bar_code: string;
  expiration_date?: number;
}

export interface ProductResponse {
  ID: number;
  name: string;
  price: number;
  nation_of_origin?: string;
  product_bar_code: string;
  expiration_date?: number;
}

export interface InventoryBatchPayload {
  ProductID: number;
  purchase_price: number;
  sale_price: number;
  quantity: number;
  expiration_date_per_batch?: string;
}

export interface ReduceInventoryPayload {
  productId: number;
  quantity: number;
}

export interface CustomerPayload {
  name: string;
  phone_number?: string;
  email?: string;
}

export interface CustomerResponse {
  ID: number;
  name: string;
  phone_number?: string;
  email?: string;
}

export interface SupplierPayload {
  Name: string;
  phone_number?: string;
  email?: string;
}

export interface SupplierResponse {
  ID: number;
  Name: string;
  phone_number?: string;
  email?: string;
}

export interface LinkSupplierPayload {
  supplier_id: number;
  product_id: number;
  supplier_price: number;
  supplier_sku?: string;
  min_order_quantity?: number;
  lead_time_days?: number;
  is_active?: boolean;
}

export interface UnlinkSupplierPayload {
  supplier_id: number;
  product_id: number;
}

export interface TransactionPayload {
  TransactionType: 'Purchase' | 'Sale' | 'Deposit' | 'Withdrawal';
  payment_type: 'paid' | 'owed';
  amount: number;
  SupplierID?: number;
  CustomerID?: number;
  TransactionDate: string;
  notes?: string;
}

export interface TransactionResponse {
  ID: number;
  TransactionType: 'Purchase' | 'Sale' | 'Deposit' | 'Withdrawal';
  payment_type: 'paid' | 'owed';
  amount: number;
  SupplierID?: number;
  CustomerID?: number;
  TransactionDate: string;
  SupplierName?: string; // Optional helper for UI
  notes?: string;
}

export interface LowStockAlert {
  ID: number;
  name: string;
  total_quantity: number;
}

export interface StockLevelResponse {
  stockLevel: number;
}

export interface BatchResponse {
  batchId: number;
}

export interface SuccessResponse {
  success: boolean;
  message?: string;
}

export interface ErrorResponse {
  success: boolean;
  error: string;
}

export interface SupplierProductResponse {
  ID: number;
  name: string;
  price: number;
  nation_of_origin?: string;
  product_bar_code: string;
  expiration_date?: number;
  supplier_price?: number;
  supplier_sku?: string;
  min_order_quantity?: number;
  lead_time_days?: number;
  is_active?: boolean;
}

export interface ProductSupplierResponse {
  ID: number;
  Name: string;
  phone_number?: string;
  email?: string;
  supplier_price?: number;
  supplier_sku?: string;
  min_order_quantity?: number;
  lead_time_days?: number;
  is_active?: boolean;
}

export interface SupplierLinkResponse {
  supplier_id: number;
  supplier_name: string;
  product_id: number;
  product_name: string;
  supplier_price?: number;
  supplier_sku?: string;
  min_order_quantity?: number;
  lead_time_days?: number;
  is_active?: boolean;
}

export interface ProductInventoryResponse {
  OrderID?: number;
  ProductID: number;
  purchase_price: number;
  sale_price: number;
  quantity: number;
  expiration_date_per_batch?: string;
  product_name: string;
}