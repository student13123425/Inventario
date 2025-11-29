import axios from 'axios';

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

export interface SupplierPayload {
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
export function createProduct(token: string, payload: ProductPayload): Promise<any> {
  return axiosInstance.post('/api/products', payload, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to create product');
    });
}

export function fetchProducts(token: string): Promise<{ success: boolean; products: ProductResponse[] }> {
  return axiosInstance.get('/api/products', { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to fetch products');
    });
}

export function fetchProductByBarcode(token: string, barcode: string): Promise<any> {
  return axiosInstance.get(`/api/products/barcode/${barcode}`, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Product not found');
    });
}

export function updateProduct(token: string, id: number, payload: Partial<ProductPayload>): Promise<any> {
  return axiosInstance.put(`/api/products/${id}`, payload, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to update product');
    });
}

// Inventory
export function addInventoryBatch(token: string, payload: InventoryBatchPayload): Promise<any> {
  return axiosInstance.post('/api/inventory', payload, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to add inventory batch');
    });
}

export function fetchStockLevel(token: string, productId: number): Promise<any> {
  return axiosInstance.get(`/api/inventory/stock-level/${productId}`, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to fetch stock level');
    });
}

export function reduceInventory(token: string, payload: ReduceInventoryPayload): Promise<any> {
  return axiosInstance.post('/api/inventory/reduce', payload, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to reduce inventory');
    });
}

// Customers
export function createCustomer(token: string, payload: CustomerPayload): Promise<any> {
  return axiosInstance.post('/api/customers', payload, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to create customer');
    });
}

export function fetchCustomers(token: string): Promise<any> {
  return axiosInstance.get('/api/customers', { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to fetch customers');
    });
}

// Suppliers
export function createSupplier(token: string, payload: SupplierPayload): Promise<any> {
  return axiosInstance.post('/api/suppliers', payload, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to create supplier');
    });
}

export function fetchSuppliers(token: string): Promise<any> {
  return axiosInstance.get('/api/suppliers', { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to fetch suppliers');
    });
}

export function linkSupplierProduct(token: string, payload: LinkSupplierPayload): Promise<any> {
  return axiosInstance.post('/api/suppliers/link', payload, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to link supplier');
    });
}

// Transactions
export function createTransaction(token: string, payload: TransactionPayload): Promise<any> {
  return axiosInstance.post('/api/transactions', payload, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to create transaction');
    });
}

export function fetchTransactions(token: string, type?: 'Purchase' | 'Sale'): Promise<any> {
  const url = type ? `/api/transactions?type=${type}` : '/api/transactions';
  return axiosInstance.get(url, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to fetch transactions');
    });
}

// Analytics
export function fetchLowStockAlerts(token: string, threshold: number = 10): Promise<any> {
  return axiosInstance.get(`/api/analytics/low-stock?threshold=${threshold}`, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to fetch low stock alerts');
    });
}

export function fetchDailySales(token: string, date?: string): Promise<any> {
  const url = date ? `/api/analytics/daily-sales?date=${date}` : '/api/analytics/daily-sales';
  return axiosInstance.get(url, { headers: getHeaders(token) })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to fetch daily sales');
    });
}