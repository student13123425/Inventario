import axios from 'axios';
import type {
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  ProductPayload,
  ProductResponse,
  InventoryBatchPayload,
  ReduceInventoryPayload,
  CustomerPayload,
  CustomerResponse,
  SupplierPayload,
  SupplierResponse,
  LinkSupplierPayload,
  TransactionPayload,
  TransactionResponse,
  LowStockAlert,
  StockLevelResponse,
  BatchResponse,
  SuccessResponse,
} from './objects';

const base_url: string = 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: base_url,
});

function getHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Auth functions
export function login(payload: LoginPayload): Promise<string> {
  return axiosInstance.post<AuthResponse>('/api/login', payload)
    .then(response => {
      const data = response.data;
      if (!data.token) {
        throw new Error('No token received from server');
      }
      return data.token;
    })
    .catch(error => {
      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data as AuthResponse;
        throw new Error(data.error || 'Login failed');
      }
      throw new Error('Login failed');
    });
}

export function register(payload: RegisterPayload): Promise<string> {
  return axiosInstance.post<AuthResponse>('/api/register', payload)
    .then(response => {
      const data = response.data;
      if (!data.token) {
        throw new Error('No token received from server');
      }
      return data.token;
    })
    .catch(error => {
      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data as AuthResponse;
        throw new Error(data.error || 'Registration failed');
      }
      throw new Error('Registration failed');
    });
}

// Products
export function createProduct(token: string, payload: ProductPayload): Promise<BatchResponse> {
  return axiosInstance.post<BatchResponse>('/api/products', payload, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to create product');
    });
}

export function fetchProducts(token: string): Promise<{ success: boolean; products: ProductResponse[] }> {
  return axiosInstance.get<{ success: boolean; products: ProductResponse[] }>('/api/products', { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to fetch products');
    });
}

export function fetchProductByBarcode(token: string, barcode: string): Promise<{ success: boolean; product: ProductResponse }> {
  return axiosInstance.get<{ success: boolean; product: ProductResponse }>(`/api/products/barcode/${barcode}`, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Product not found');
    });
}

export function updateProduct(token: string, id: number, payload: Partial<ProductPayload>): Promise<SuccessResponse> {
  return axiosInstance.put<SuccessResponse>(`/api/products/${id}`, payload, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to update product');
    });
}

// Inventory
export function addInventoryBatch(token: string, payload: InventoryBatchPayload): Promise<BatchResponse> {
  return axiosInstance.post<BatchResponse>('/api/inventory', payload, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to add inventory batch');
    });
}

export function fetchStockLevel(token: string, productId: number): Promise<StockLevelResponse> {
  return axiosInstance.get<StockLevelResponse>(`/api/inventory/stock-level/${productId}`, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to fetch stock level');
    });
}

export function reduceInventory(token: string, payload: ReduceInventoryPayload): Promise<SuccessResponse> {
  return axiosInstance.post<SuccessResponse>('/api/inventory/reduce', payload, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to reduce inventory');
    });
}

// Customers
export function createCustomer(token: string, payload: CustomerPayload): Promise<BatchResponse> {
  return axiosInstance.post<BatchResponse>('/api/customers', payload, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to create customer');
    });
}

export function fetchCustomers(token: string): Promise<{ success: boolean; customers: CustomerResponse[] }> {
  return axiosInstance.get<{ success: boolean; customers: CustomerResponse[] }>('/api/customers', { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to fetch customers');
    });
}

// Suppliers
export function createSupplier(token: string, payload: SupplierPayload): Promise<BatchResponse> {
  return axiosInstance.post<BatchResponse>('/api/suppliers', payload, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to create supplier');
    });
}

export function fetchSuppliers(token: string): Promise<{ success: boolean; suppliers: SupplierResponse[] }> {
  return axiosInstance.get<{ success: boolean; suppliers: SupplierResponse[] }>('/api/suppliers', { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to fetch suppliers');
    });
}

export function linkSupplierProduct(token: string, payload: LinkSupplierPayload): Promise<SuccessResponse> {
  return axiosInstance.post<SuccessResponse>('/api/suppliers/link', payload, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to link supplier');
    });
}

// Transactions
export function createTransaction(token: string, payload: TransactionPayload): Promise<BatchResponse> {
  return axiosInstance.post<BatchResponse>('/api/transactions', payload, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to create transaction');
    });
}

export function fetchTransactions(token: string, type?: 'Purchase' | 'Sale'): Promise<{ success: boolean; transactions: TransactionResponse[] }> {
  const url = type ? `/api/transactions?type=${type}` : '/api/transactions';
  return axiosInstance.get<{ success: boolean; transactions: TransactionResponse[] }>(url, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to fetch transactions');
    });
}

// Analytics
export function fetchLowStockAlerts(token: string, threshold: number = 10): Promise<{ success: boolean; lowStockAlerts: LowStockAlert[] }> {
  return axiosInstance.get<{ success: boolean; lowStockAlerts: LowStockAlert[] }>(`/api/analytics/low-stock?threshold=${threshold}`, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to fetch low stock alerts');
    });
}

export function fetchDailySales(token: string, date?: string): Promise<{ success: boolean; dailySales: number }> {
  const url = date ? `/api/analytics/daily-sales?date=${date}` : '/api/analytics/daily-sales';
  return axiosInstance.get<{ success: boolean; dailySales: number }>(url, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to fetch daily sales');
    });
}

export function checkToken(token: string): Promise<{ 
  success: boolean; 
  user: { id: number; email: string; shop_name: string };
  message: string 
}> {
  return axiosInstance.get<{ 
    success: boolean; 
    user: { id: number; email: string; shop_name: string };
    message: string 
  }>('/api/check-token', { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data as { success: boolean; error: string };
        throw new Error(data.error || 'Token validation failed');
      }
      throw new Error('Token validation failed');
    });
}