// objects.ts - Client-side type definitions for the Inventory Management System

// ============================================
// CORE DATA TYPES
// ============================================

export interface Product {
  ID?: number;
  name: string;
  price: number;
  nation_of_origin?: string;
  product_bar_code: string;
  expiration_date?: number;
}

export interface InventoryBatch {
  OrderID?: number;
  ProductID: number;
  purchase_price: number;
  sale_price: number;
  quantity: number;
  expiration_date_per_batch?: string;
}

export interface Customer {
  ID?: number;
  name: string;
  phone_number?: string;
  email?: string;
}

export interface Supplier {
  ID?: number;
  Name: string;
  phone_number?: string;
  email?: string;
}

export interface TransactionRecord {
  ID?: number;
  TransactionType: 'Purchase' | 'Sale';
  payment_type: 'paid' | 'owed';
  amount: number;
  SupplierID?: number;
  CustomerID?: number;
  TransactionDate: string;
  notes?: string;
  SupplierName?: string; // For UI display
}

export interface SupplierProductLink {
  supplier_id: number;
  supplier_name: string;
  product_id: number;
  product_name: string;
  supplier_price: number;
  supplier_sku?: string;
  min_order_quantity?: number;
  lead_time_days?: number;
  is_active: boolean;
}

// ============================================
// ANALYTICS DATA TYPES
// ============================================

export interface SalesTrendData {
  period: string;
  total_sales: number;
  transaction_count: number;
}

export interface TopProductData {
  ID: number;
  name: string;
  product_bar_code: string;
  total_quantity_sold: number;
  sale_occurrences: number;
  avg_sale_price: number;
  estimated_revenue: number;
}

export interface InventoryTurnoverData {
  ID: number;
  name: string;
  total_sold: number;
  avg_inventory: number;
  turnover_rate: number;
}

export interface ProfitMarginData {
  total_revenue: number;
  total_cogs: number;
  gross_profit: number;
  gross_margin_percentage: number;
}

export interface CustomerLifetimeValue {
  ID: number;
  name: string;
  email: string;
  total_transactions: number;
  total_spent: number;
  avg_transaction_value: number;
  first_purchase: string;
  last_purchase: string;
}

export interface StockAlertData {
  ID: number;
  name: string;
  total_quantity: number;
}

export interface DailySalesData {
  total: number;
  date: string;
}

export interface SupplierPerformance {
  ID: number;
  Name: string;
  total_purchases: number;
  avg_lead_time: number;
  on_time_deliveries: number;
}

export interface InventoryValuation {
  product_id: number;
  product_name: string;
  total_quantity: number;
  avg_purchase_price: number;
  current_value: number;
}

export interface PaymentAnalysis {
  total_owed: number;
  total_paid: number;
  outstanding_balance: number;
}

export interface OverallAnalytics {
  user_id: number;
  shop_name: string;
  collection_date: string;
  
  // Key Metrics
  total_inventory_value: number;
  today_sales: number;
  total_customers: number;
  total_products: number;
  pending_payments: number;
  
  // Sales Analytics
  sales_trends: SalesTrendData[];
  top_products: TopProductData[];
  
  // Inventory Analytics
  inventory_turnover: InventoryTurnoverData[];
  low_stock_alerts: StockAlertData[];
  inventory_valuation: InventoryValuation[];
  
  // Financial Analytics
  profit_margin: ProfitMarginData;
  daily_sales: DailySalesData;
  payment_analysis: PaymentAnalysis;
  
  // Customer Analytics
  customer_lifetime_value: CustomerLifetimeValue[];
  
  // Supplier Analytics
  supplier_performance: SupplierPerformance[];
}

export interface StatisticsSummary {
  timestamp: string;
  total_users: number;
  users_analytics: OverallAnalytics[];
}

export interface ServerInfo {
  success: boolean;
  server_name: string;
  version: string;
  timestamp: string;
  statistics: {
    auto_save_interval_hours: number;
    stats_file: {
      exists: boolean;
      size: number;
      lastModified: string | null;
    };
    next_auto_save: string;
  };
  endpoints: {
    public: string[];
    protected: string[];
  };
}

export interface DashboardData {
  total_inventory_value: number;
  today_sales: number;
  low_stock_count: number;
  outstanding_balance: number;
  low_stock_alerts: StockAlertData[];
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  error?: string;
}

export interface UserInfo {
  id: number;
  email: string;
  shop_name: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

// ============================================
// REQUEST BODY TYPES
// ============================================

export interface RegisterRequest {
  shopName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ProductRequest {
  name: string;
  price: number;
  nation_of_origin?: string;
  product_bar_code: string;
  expiration_date?: number;
}

export interface InventoryBatchRequest {
  ProductID: number;
  purchase_price: number;
  sale_price: number;
  quantity: number;
  expiration_date_per_batch?: string;
}

export interface CustomerRequest {
  name: string;
  phone_number?: string;
  email?: string;
}

export interface SupplierRequest {
  Name: string;
  phone_number?: string;
  email?: string;
}

export interface SupplierProductLinkRequest {
  supplier_id: number;
  product_id: number;
  supplier_price: number;
  supplier_sku?: string;
  min_order_quantity?: number;
  lead_time_days?: number;
  is_active?: boolean;
}

export interface TransactionRequest {
  TransactionType: 'Purchase' | 'Sale';
  payment_type: 'paid' | 'owed';
  amount: number;
  SupplierID?: number;
  CustomerID?: number;
  TransactionDate: string;
  notes?: string;
}

// ============================================
// DEFAULT VALUES
// ============================================

export const DEFAULT_ANALYTICS: OverallAnalytics = {
  user_id: 0,
  shop_name: '',
  collection_date: new Date().toISOString(),
  total_inventory_value: 0,
  today_sales: 0,
  total_customers: 0,
  total_products: 0,
  pending_payments: 0,
  sales_trends: [],
  top_products: [],
  inventory_turnover: [],
  low_stock_alerts: [],
  inventory_valuation: [],
  profit_margin: {
    total_revenue: 0,
    total_cogs: 0,
    gross_profit: 0,
    gross_margin_percentage: 0
  },
  daily_sales: {
    total: 0,
    date: new Date().toISOString().split('T')[0]
  },
  payment_analysis: {
    total_owed: 0,
    total_paid: 0,
    outstanding_balance: 0
  },
  customer_lifetime_value: [],
  supplier_performance: []
};