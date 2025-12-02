// network.ts - Axios-based API client for Public Statistics

import type { AxiosError, AxiosInstance } from 'axios';
import type {
    StatisticsSummary,
    ApiResponse
} from './objects';
import axios from 'axios';

// ============================================
// CONFIGURATION
// ============================================

const API_BASE_URL = 'http://localhost:3000';
const API_TIMEOUT = 30000; // 30 seconds

// ============================================
// AXIOS INSTANCE SETUP
// ============================================

class PublicStatsClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Simple response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );
  }

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  /**
   * Fetches the publicly available StatisticsSummary from the server.
   * This endpoint does NOT require authentication.
   */
  async getPublicStats(): Promise<ApiResponse<StatisticsSummary>> {
    try {
      // The server returns a success: boolean, timestamp, total_users, and users_analytics array
      const response = await this.axiosInstance.get('/api/public/stats');
      
      // The server's public stats endpoint returns the summary object *directly* as the body, 
      // with success/error/message wrapping it.
      // We must map it to the ApiResponse<StatisticsSummary> structure.
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Manually triggers the server to collect and save the statistics file.
   * This endpoint is public (unauthenticated) on the server.
   */
  async triggerPublicStatsCollection(): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.post('/api/public/stats/collect');
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

export const publicStatsClient = new PublicStatsClient();