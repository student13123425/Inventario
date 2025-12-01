// network.ts - Axios-based API client for the Inventory Management System

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type // Core types
{
    // Core types
    Product,
    InventoryBatch,
    Customer,
    Supplier,
    TransactionRecord,
    SupplierProductLink,

    // Analytics types
    OverallAnalytics,
    StatisticsSummary,
    ServerInfo,
    DashboardData,
    SalesTrendData,
    TopProductData,
    InventoryTurnoverData,
    ProfitMarginData,
    CustomerLifetimeValue,
    StockAlertData,
    SupplierPerformance,
    InventoryValuation,
    PaymentAnalysis,

    // Request types
    RegisterRequest,
    LoginRequest,
    ProductRequest,
    InventoryBatchRequest,
    CustomerRequest,
    SupplierRequest,
    SupplierProductLinkRequest,
    TransactionRequest,

    // Response types
    ApiResponse,
    AuthResponse,
    UserInfo
} from './objects';

// ============================================
// CONFIGURATION
// ============================================

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const API_TIMEOUT = 30000; // 30 seconds

// ============================================
// AXIOS INSTANCE SETUP
// ============================================

class ApiClient {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearToken();
          // You might want to redirect to login here
          console.error('Authentication failed. Please login again.');
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.axiosInstance.post('/api/register', data);
      if (response.data.success && response.data.token) {
        this.setToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.axiosInstance.post('/api/login', data);
      if (response.data.success && response.data.token) {
        this.setToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getPublicStats(): Promise<ApiResponse<StatisticsSummary>> {
    try {
      const response = await this.axiosInstance.get('/api/public/stats');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async triggerPublicStatsCollection(): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.post('/api/public/stats/collect');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getServerInfo(): Promise<ApiResponse<ServerInfo>> {
    try {
      const response = await this.axiosInstance.get('/api/public/server-info');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ============================================
  // PROTECTED ENDPOINTS - PRODUCTS
  // ============================================

  async createProduct(data: ProductRequest): Promise<ApiResponse<{ productId: number }>> {
    try {
      const response = await this.axiosInstance.post('/api/products', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAllProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const response = await this.axiosInstance.get('/api/products');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getProductByBarcode(barcode: string): Promise<ApiResponse<Product>> {
    try {
      const response = await this.axiosInstance.get(`/api/products/barcode/${barcode}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.put(`/api/products/${id}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteProduct(id: number): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.delete(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ============================================
  // PROTECTED ENDPOINTS - INVENTORY
  // ============================================

  async addInventoryBatch(data: InventoryBatchRequest): Promise<ApiResponse<{ batchId: number }>> {
    try {
      const response = await this.axiosInstance.post('/api/inventory', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateInventoryBatch(id: number, data: Partial<InventoryBatch>): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.put(`/api/inventory/${id}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteInventoryBatch(id: number): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.delete(`/api/inventory/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getProductStockLevel(productId: number): Promise<ApiResponse<{ stockLevel: number }>> {
    try {
      const response = await this.axiosInstance.get(`/api/inventory/stock-level/${productId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async reduceInventoryFIFO(productId: number, quantity: number): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.post('/api/inventory/reduce', { productId, quantity });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ============================================
  // PROTECTED ENDPOINTS - CUSTOMERS
  // ============================================

  async createCustomer(data: CustomerRequest): Promise<ApiResponse<{ customerId: number }>> {
    try {
      const response = await this.axiosInstance.post('/api/customers', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getCustomers(): Promise<ApiResponse<Customer[]>> {
    try {
      const response = await this.axiosInstance.get('/api/customers');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateCustomer(id: number, data: Partial<Customer>): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.put(`/api/customers/${id}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteCustomer(id: number): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.delete(`/api/customers/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ============================================
  // PROTECTED ENDPOINTS - SUPPLIERS
  // ============================================

  async createSupplier(data: SupplierRequest): Promise<ApiResponse<{ supplierId: number }>> {
    try {
      const response = await this.axiosInstance.post('/api/suppliers', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getSuppliers(): Promise<ApiResponse<Supplier[]>> {
    try {
      const response = await this.axiosInstance.get('/api/suppliers');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateSupplier(id: number, data: Partial<Supplier>): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.put(`/api/suppliers/${id}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteSupplier(id: number): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.delete(`/api/suppliers/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ============================================
  // PROTECTED ENDPOINTS - SUPPLIER-PRODUCT LINKS
  // ============================================

  async linkSupplierToProduct(data: SupplierProductLinkRequest): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.post('/api/suppliers/link', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async unlinkSupplierFromProduct(supplierId: number, productId: number): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.delete(`/api/suppliers/${supplierId}/products/${productId}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getProductsBySupplier(supplierId: number): Promise<ApiResponse<Product[]>> {
    try {
      const response = await this.axiosInstance.get(`/api/suppliers/${supplierId}/products`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getSuppliersByProduct(productId: number): Promise<ApiResponse<Supplier[]>> {
    try {
      const response = await this.axiosInstance.get(`/api/products/${productId}/suppliers`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAllSupplierProductLinks(): Promise<ApiResponse<SupplierProductLink[]>> {
    try {
      const response = await this.axiosInstance.get('/api/suppliers-links');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ============================================
  // PROTECTED ENDPOINTS - TRANSACTIONS
  // ============================================

  async createTransaction(data: TransactionRequest): Promise<ApiResponse<{ transactionId: number }>> {
    try {
      const response = await this.axiosInstance.post('/api/transactions', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTransactions(type?: 'Purchase' | 'Sale'): Promise<ApiResponse<TransactionRecord[]>> {
    try {
      const url = type ? `/api/transactions?type=${type}` : '/api/transactions';
      const response = await this.axiosInstance.get(url);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateTransaction(id: number, data: Partial<TransactionRecord>): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.put(`/api/transactions/${id}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteTransaction(id: number): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.delete(`/api/transactions/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ============================================
  // PROTECTED ENDPOINTS - ANALYTICS (Getting analytics from server)
  // ============================================

  async getLowStockAlerts(threshold: number = 10): Promise<ApiResponse<StockAlertData[]>> {
    try {
      const response = await this.axiosInstance.get(`/api/analytics/low-stock?threshold=${threshold}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getDailySales(date?: string): Promise<ApiResponse<{ dailySales: number }>> {
    try {
      const url = date ? `/api/analytics/daily-sales?date=${date}` : '/api/analytics/daily-sales';
      const response = await this.axiosInstance.get(url);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getSalesTrends(
    period: 'daily' | 'weekly' | 'monthly' = 'monthly',
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<{ trends: SalesTrendData[] }>> {
    try {
      let url = `/api/analytics/sales-trends?period=${period}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
      const response = await this.axiosInstance.get(url);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTopProducts(
    limit: number = 10,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<{ topProducts: TopProductData[] }>> {
    try {
      let url = `/api/analytics/top-products?limit=${limit}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
      const response = await this.axiosInstance.get(url);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getInventoryTurnover(productId?: number): Promise<ApiResponse<{ turnover: InventoryTurnoverData[] | InventoryTurnoverData }>> {
    try {
      const url = productId 
        ? `/api/analytics/inventory-turnover?productId=${productId}`
        : '/api/analytics/inventory-turnover';
      
      const response = await this.axiosInstance.get(url);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getProfitMargin(startDate?: string, endDate?: string): Promise<ApiResponse<{ profitMargin: ProfitMarginData }>> {
    try {
      let url = '/api/analytics/profit-margin';
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      
      const response = await this.axiosInstance.get(url);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getCustomerLifetimeValue(): Promise<ApiResponse<{ customerLifetime: CustomerLifetimeValue[] }>> {
    try {
      const response = await this.axiosInstance.get('/api/analytics/customer-lifetime-value');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getSupplierPerformance(): Promise<ApiResponse<{ supplierPerformance: SupplierPerformance[] }>> {
    try {
      const response = await this.axiosInstance.get('/api/analytics/supplier-performance');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getInventoryValuation(): Promise<ApiResponse<{ inventoryValuation: InventoryValuation[] }>> {
    try {
      const response = await this.axiosInstance.get('/api/analytics/inventory-valuation');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getPaymentAnalysis(): Promise<ApiResponse<{ paymentAnalysis: PaymentAnalysis }>> {
    try {
      const response = await this.axiosInstance.get('/api/analytics/payment-analysis');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getCompleteAnalytics(): Promise<ApiResponse<{ analytics: OverallAnalytics }>> {
    try {
      const response = await this.axiosInstance.get('/api/analytics/complete');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getDashboardData(): Promise<ApiResponse<{ dashboard: DashboardData }>> {
    try {
      const response = await this.axiosInstance.get('/api/analytics/dashboard');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ============================================
  // PROTECTED ENDPOINTS - AUTH & ADMIN
  // ============================================

  async checkToken(): Promise<ApiResponse<{ user: UserInfo; message: string }>> {
    try {
      const response = await this.axiosInstance.get('/api/check-token');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async triggerStatsSave(): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.post('/api/admin/save-stats');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async stopStatsCollection(): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.post('/api/admin/stop-stats-collection');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async startStatsCollection(intervalHours: number = 6): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.post('/api/admin/start-stats-collection', { intervalHours });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ============================================
  // RELATIONSHIP ENDPOINTS
  // ============================================

  async getProductInventory(productId: number): Promise<ApiResponse<{ inventory: InventoryBatch[] }>> {
    try {
      const response = await this.axiosInstance.get(`/api/products/${productId}/inventory`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getCustomerTransactions(customerId: number): Promise<ApiResponse<{ transactions: TransactionRecord[] }>> {
    try {
      const response = await this.axiosInstance.get(`/api/customers/${customerId}/transactions`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getSupplierTransactions(supplierId: number): Promise<ApiResponse<{ transactions: TransactionRecord[] }>> {
    try {
      const response = await this.axiosInstance.get(`/api/suppliers/${supplierId}/transactions`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ============================================
  // ERROR HANDLING
  // ============================================

  private handleError(error: any): ApiResponse {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        // Server responded with an error status
        return {
          success: false,
          error: axiosError.response.data?.error || `Server error: ${axiosError.response.status}`,
          message: axiosError.response.data?.message
        };
      } else if (axiosError.request) {
        // Request was made but no response received
        return {
          success: false,
          error: 'No response from server. Please check your connection.'
        };
      } else {
        // Error in request setup
        return {
          success: false,
          error: `Request error: ${axiosError.message}`
        };
      }
    }
    
    // Non-Axios error
    return {
      success: false,
      error: error.message || 'An unknown error occurred'
    };
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================

export const apiClient = new ApiClient();

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

export function isLoggedIn(): boolean {
  return !!localStorage.getItem('auth_token');
}

export function getStoredToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function logout(): void {
  localStorage.removeItem('auth_token');
  apiClient.clearToken();
}

// ============================================
// BATCH OPERATIONS
// ============================================

export async function fetchAllAnalyticsData(): Promise<{
  dashboard: DashboardData;
  salesTrends: SalesTrendData[];
  topProducts: TopProductData[];
  lowStockAlerts: StockAlertData[];
  paymentAnalysis: PaymentAnalysis;
  inventoryValuation: InventoryValuation[];
} | null> {
  try {
    const [
      dashboardResponse,
      salesTrendsResponse,
      topProductsResponse,
      lowStockResponse,
      paymentResponse,
      inventoryResponse
    ] = await Promise.all([
      apiClient.getDashboardData(),
      apiClient.getSalesTrends(),
      apiClient.getTopProducts(),
      apiClient.getLowStockAlerts(),
      apiClient.getPaymentAnalysis(),
      apiClient.getInventoryValuation()
    ]);

    if (
      dashboardResponse.success &&
      salesTrendsResponse.success &&
      topProductsResponse.success &&
      lowStockResponse.success &&
      paymentResponse.success &&
      inventoryResponse.success
    ) {
      return {
        dashboard: dashboardResponse.data?.dashboard,
        salesTrends: salesTrendsResponse.data?.trends,
        topProducts: topProductsResponse.data?.topProducts,
        lowStockAlerts: lowStockResponse.data?.lowStockAlerts,
        paymentAnalysis: paymentResponse.data?.paymentAnalysis,
        inventoryValuation: inventoryResponse.data?.inventoryValuation
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching all analytics:', error);
    return null;
  }
}