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
    total_inventory_value: number;
    today_sales: number;
    total_customers: number;
    total_products: number;
    pending_payments: number;
    sales_trends: SalesTrendData[];
    top_products: TopProductData[];
    inventory_turnover: InventoryTurnoverData[];
    low_stock_alerts: StockAlertData[];
    inventory_valuation: InventoryValuation[];
    profit_margin: ProfitMarginData;
    daily_sales: DailySalesData;
    payment_analysis: PaymentAnalysis;
    customer_lifetime_value: CustomerLifetimeValue[];
    supplier_performance: SupplierPerformance[];
}
export interface StatisticsSummary {
    timestamp: string;
    total_users: number;
    users_analytics: OverallAnalytics[];
}
export declare const DEFAULT_ANALYTICS: OverallAnalytics;
