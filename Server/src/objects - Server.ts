// objects.ts - Analytics data types and structures

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

// Default values for empty analytics
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