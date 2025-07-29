import { ApiResponse, ApiError, QueryParams, PaginatedResponse } from '@/types/api';

export abstract class BaseApiService {
  protected baseUrl: string;
  protected timeout: number;

  constructor(baseUrl: string = '/api', timeout: number = 10000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Simulate network delay for realistic behavior
      await this.simulateDelay();

      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  protected async get<T>(endpoint: string, params?: QueryParams): Promise<ApiResponse<T>> {
    const searchParams = params ? new URLSearchParams(this.buildQueryString(params)) : '';
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;
    
    return this.request<T>(url, {
      method: 'GET',
    });
  }

  protected async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  private buildQueryString(params: QueryParams): Record<string, string> {
    const query: Record<string, string> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          query[key] = JSON.stringify(value);
        } else {
          query[key] = String(value);
        }
      }
    });
    
    return query;
  }

  private async simulateDelay(): Promise<void> {
    // Simulate realistic API response time (100-300ms)
    const delay = Math.random() * 200 + 100;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  protected handleError(error: unknown): ApiError {
    if (error instanceof Error) {
      return {
        message: error.message,
        status: 500,
      };
    }
    
    return {
      message: 'An unknown error occurred',
      status: 500,
    };
  }
}