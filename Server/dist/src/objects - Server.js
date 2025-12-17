// objects.ts - Analytics data types and structures
// Default values for empty analytics
export const DEFAULT_ANALYTICS = {
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
//# sourceMappingURL=objects%20-%20Server.js.map