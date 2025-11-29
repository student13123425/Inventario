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
  supplierId: number;
  productId: number;
}

export interface TransactionPayload {
  TransactionType: 'Purchase' | 'Sale';
  payment_type: 'paid' | 'owed';
  amount: number;
  SupplierID?: number;
  CustomerID?: number;
  TransactionDate: string;
}

export interface TransactionResponse {
  ID: number;
  TransactionType: 'Purchase' | 'Sale';
  payment_type: 'paid' | 'owed';
  amount: number;
  SupplierID?: number;
  CustomerID?: number;
  TransactionDate: string;
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