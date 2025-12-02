import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type {
  StatisticsSummary,
  ApiResponse,
  AdminLoginCredentials,
  ChangeAdminCredentialsRequest
} from './objects';
import axios from 'axios';
import { AdminStorage } from './storage';

const API_BASE_URL = 'http://localhost:3000';
const API_TIMEOUT = 30000;

class AdminApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = AdminStorage.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => Promise.reject(error)
    );
  }

  async login(credentials: AdminLoginCredentials): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.post('/api/admin/login', credentials);

      if (response.data.success && response.data.token) {
        AdminStorage.saveToken(response.data.token);
      }

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async changeCredentials(data: ChangeAdminCredentialsRequest): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.post('/api/admin/change-credentials', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  logout(): void {
    AdminStorage.clearToken();
  }

  async getAdminStats(): Promise<ApiResponse<StatisticsSummary>> {
    try {
      const response = await this.axiosInstance.get('/api/admin/stats');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async triggerStatsCollection(): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.post('/api/admin/stats/collect');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): ApiResponse {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        return {
          success: false,
          error: (axiosError.response.data as any)?.error || `Server error: ${axiosError.response.status}`,
          message: (axiosError.response.data as any)?.message
        };
      } else if (axiosError.request) {
        return {
          success: false,
          error: 'No response from server. Please check your connection.'
        };
      } else {
        return {
          success: false,
          error: `Request error: ${axiosError.message}`
        };
      }
    }

    return {
      success: false,
      error: error.message || 'An unknown error occurred'
    };
  }
}

export const adminClient = new AdminApiClient();
