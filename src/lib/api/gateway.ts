// API Gateway - Single entry point for all API requests
// Implements centralized error handling, request/response transformation
// Includes organization context headers for multi-tenant data access

import { ApiResponse, ApiError, QueryParams } from '@/types/api';
import { config } from '@/lib/config';

const ORG_STORAGE_KEY = 'current_organization_id';

export interface GatewayConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  onError?: (error: GatewayError) => void;
}

export interface GatewayError {
  code: string;
  message: string;
  status: number;
  details?: Record<string, unknown>;
  timestamp: string;
}

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method: RequestMethod;
  body?: unknown;
  params?: QueryParams;
  headers?: Record<string, string>;
  /** Override the default organization ID for this request */
  organizationId?: string;
  /** Skip organization header (for auth endpoints) */
  skipOrgHeader?: boolean;
}

const DEFAULT_CONFIG: GatewayConfig = {
  baseUrl: config.apiGatewayUrl || '/api',
  timeout: 10000,
  retries: 1,
};

class ApiGateway {
  private config: GatewayConfig;
  private errorHandlers: Set<(error: GatewayError) => void> = new Set();
  private authToken: string | null = null;

  constructor(config: Partial<GatewayConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Set authentication token
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  // Get current organization ID from storage
  private getCurrentOrgId(): string | null {
    return localStorage.getItem(ORG_STORAGE_KEY);
  }

  // Register global error handler
  onError(handler: (error: GatewayError) => void): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  // Notify all error handlers
  private notifyError(error: GatewayError): void {
    this.errorHandlers.forEach(handler => handler(error));
    this.config.onError?.(error);
  }

  // Create standardized error
  private createError(
    code: string,
    message: string,
    status: number = 500,
    details?: Record<string, unknown>
  ): GatewayError {
    return {
      code,
      message,
      status,
      details,
      timestamp: new Date().toISOString(),
    };
  }

  // Build URL with query params
  private buildUrl(endpoint: string, params?: QueryParams): string {
    const url = new URL(`${this.config.baseUrl}${endpoint}`, window.location.origin);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(
            key,
            typeof value === 'object' ? JSON.stringify(value) : String(value)
          );
        }
      });
    }
    
    return url.pathname + url.search;
  }

  // Build headers with auth and organization context
  private buildHeaders(options: RequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    // Add organization context header
    if (!options.skipOrgHeader) {
      const orgId = options.organizationId || this.getCurrentOrgId();
      if (orgId) {
        headers['X-Organization-ID'] = orgId;
      }
    }

    return headers;
  }

  // Core request method with retry logic
  private async executeRequest<T>(
    endpoint: string,
    options: RequestOptions,
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    const { method, body, params } = options;
    const url = this.buildUrl(endpoint, params);
    const headers = this.buildHeaders(options);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      // Simulate API delay (remove in production)
      await this.simulateDelay();

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized - clear token and notify
      if (response.status === 401) {
        this.authToken = null;
        const error = this.createError('UNAUTHORIZED', 'Session expired. Please log in again.', 401);
        this.notifyError(error);
        return { success: false, error: error.message };
      }

      // Handle 403 Forbidden - organization access denied
      if (response.status === 403) {
        const error = this.createError(
          'FORBIDDEN',
          'You do not have permission to access this resource.',
          403
        );
        this.notifyError(error);
        return { success: false, error: error.message };
      }

      if (!response.ok) {
        const error = this.createError(
          'HTTP_ERROR',
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
        this.notifyError(error);
        return { success: false, error: error.message };
      }

      // Some environments return HTML (index.html / error pages) for unknown /api routes.
      // Guard JSON parsing to avoid "Unexpected token <" errors.
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        const error = this.createError(
          'INVALID_RESPONSE',
          'Received non-JSON response from API',
          502,
          { contentType, preview: text.slice(0, 200) }
        );
        this.notifyError(error);
        return { success: false, error: error.message };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (err) {
      clearTimeout(timeoutId);

      // Retry logic for network errors
      if (attempt < this.config.retries && this.isRetryableError(err)) {
        return this.executeRequest<T>(endpoint, options, attempt + 1);
      }

      const error = this.createError(
        this.getErrorCode(err),
        this.getErrorMessage(err),
        this.getErrorStatus(err)
      );
      this.notifyError(error);
      return { success: false, error: error.message };
    }
  }

  private isRetryableError(err: unknown): boolean {
    if (err instanceof Error) {
      return err.name === 'AbortError' || err.message.includes('network');
    }
    return false;
  }

  private getErrorCode(err: unknown): string {
    if (err instanceof Error) {
      if (err.name === 'AbortError') return 'TIMEOUT';
      if (err.message.includes('network')) return 'NETWORK_ERROR';
    }
    return 'UNKNOWN_ERROR';
  }

  private getErrorMessage(err: unknown): string {
    if (err instanceof Error) {
      if (err.name === 'AbortError') return 'Request timed out';
      return err.message;
    }
    return 'An unknown error occurred';
  }

  private getErrorStatus(err: unknown): number {
    if (err instanceof Error && err.name === 'AbortError') return 408;
    return 500;
  }

  private async simulateDelay(): Promise<void> {
    const delay = Math.random() * 200 + 100;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Public API methods with organization context support
  async get<T>(
    endpoint: string,
    params?: QueryParams,
    options?: Pick<RequestOptions, 'organizationId' | 'skipOrgHeader' | 'headers'>
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(endpoint, { method: 'GET', params, ...options });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    params?: QueryParams,
    options?: Pick<RequestOptions, 'organizationId' | 'skipOrgHeader' | 'headers'>
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(endpoint, { method: 'POST', body, params, ...options });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    params?: QueryParams,
    options?: Pick<RequestOptions, 'organizationId' | 'skipOrgHeader' | 'headers'>
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(endpoint, { method: 'PUT', body, params, ...options });
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    params?: QueryParams,
    options?: Pick<RequestOptions, 'organizationId' | 'skipOrgHeader' | 'headers'>
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(endpoint, { method: 'PATCH', body, params, ...options });
  }

  async delete<T>(
    endpoint: string,
    params?: QueryParams,
    options?: Pick<RequestOptions, 'organizationId' | 'skipOrgHeader' | 'headers'>
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(endpoint, { method: 'DELETE', params, ...options });
  }
}

// Singleton instance
export const apiGateway = new ApiGateway();

// Factory for creating service-specific gateways
export const createGateway = (config: Partial<GatewayConfig>) => new ApiGateway(config);
