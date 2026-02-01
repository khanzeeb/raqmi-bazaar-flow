/**
 * Base Gateway - Reusable patterns for API gateways
 * Provides consistent API call handling with fallback to mock data
 */

import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api';
import { config } from '@/lib/config';

export interface GatewayConfig {
  /** Base URL for the API endpoint */
  baseUrl: string;
  /** Entity name for logging */
  entityName: string;
  /** Enable mock fallback when API is unavailable */
  enableMockFallback?: boolean;
}

/**
 * Build query string from params
 */
export function buildQueryString(params?: QueryParams): string {
  if (!params) return '';
  
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    
    if (key === 'filters' && typeof value === 'object') {
      Object.entries(value as Record<string, unknown>).forEach(([filterKey, filterValue]) => {
        if (filterValue !== undefined && filterValue !== null) {
          if (typeof filterValue === 'object') {
            // Handle nested objects like priceRange
            Object.entries(filterValue as Record<string, unknown>).forEach(([nestedKey, nestedValue]) => {
              if (nestedValue !== undefined && nestedValue !== null) {
                searchParams.append(`${filterKey}_${nestedKey}`, String(nestedValue));
              }
            });
          } else {
            searchParams.append(filterKey, String(filterValue));
          }
        }
      });
    } else {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, data, message };
}

/**
 * Create a standardized error response
 */
export function errorResponse<T>(error: string): ApiResponse<T> {
  return { success: false, error };
}

/**
 * Create paginated response from array
 */
export function paginateArray<T>(
  items: T[],
  page: number = 1,
  limit: number = 10
): PaginatedResponse<T> {
  const start = (page - 1) * limit;
  const paginatedData = items.slice(start, start + limit);
  
  return {
    data: paginatedData,
    total: items.length,
    page,
    limit,
    totalPages: Math.ceil(items.length / limit),
  };
}

/**
 * Wrapper for fetch with consistent error handling
 */
export async function fetchWithFallback<T>(
  url: string,
  options: RequestInit = {},
  fallback: () => T
): Promise<T> {
  try {
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
    return data.data ?? data;
  } catch (error) {
    if (config.useMockData || config.environment === 'development') {
      console.warn(`API unavailable, using mock data:`, error);
      return fallback();
    }
    throw error;
  }
}

/**
 * Standard CRUD gateway interface
 */
export interface ICRUDGateway<TEntity, TCreateDTO, TUpdateDTO, TFilters = Record<string, unknown>> {
  getAll(params?: QueryParams & { filters?: TFilters }): Promise<ApiResponse<PaginatedResponse<TEntity>>>;
  getById(id: string): Promise<ApiResponse<TEntity>>;
  create(data: TCreateDTO): Promise<ApiResponse<TEntity>>;
  update(id: string, data: Partial<TUpdateDTO>): Promise<ApiResponse<TEntity>>;
  delete(id: string): Promise<ApiResponse<boolean>>;
}

/**
 * Create a basic CRUD gateway
 */
export function createCRUDGateway<TEntity extends { id: string }, TCreateDTO, TUpdateDTO, TFilters = Record<string, unknown>>(
  config: GatewayConfig & {
    mockData?: TEntity[];
    filterFn?: (item: TEntity, filters: TFilters, search?: string) => boolean;
  }
): ICRUDGateway<TEntity, TCreateDTO, TUpdateDTO, TFilters> {
  const { baseUrl, entityName, mockData = [], filterFn } = config;

  return {
    async getAll(params) {
      try {
        const queryString = buildQueryString(params);
        const response = await fetch(`${baseUrl}${queryString}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        return successResponse({
          data: data.data || data,
          total: data.total || data.length || 0,
          page: data.page || params?.page || 1,
          limit: data.limit || params?.limit || 10,
          totalPages: data.totalPages || Math.ceil((data.total || data.length || 0) / (params?.limit || 10)),
        });
      } catch (error) {
        console.warn(`${entityName} API unavailable, using mock data`);
        
        let filtered = [...mockData];
        
        if (filterFn && params?.filters) {
          filtered = filtered.filter(item => filterFn(item, params.filters as TFilters, params.search));
        } else if (params?.search) {
          const search = params.search.toLowerCase();
          filtered = filtered.filter(item => 
            JSON.stringify(item).toLowerCase().includes(search)
          );
        }
        
        return successResponse(paginateArray(filtered, params?.page, params?.limit));
      }
    },

    async getById(id) {
      try {
        const response = await fetch(`${baseUrl}/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            return errorResponse(`${entityName} not found`);
          }
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        return successResponse(data.data || data);
      } catch (error) {
        console.warn(`${entityName} API unavailable, using mock data`);
        const item = mockData.find(m => m.id === id);
        if (item) {
          return successResponse(item);
        }
        return errorResponse(`${entityName} not found`);
      }
    },

    async create(data) {
      try {
        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return errorResponse(errorData.message || `Failed to create ${entityName.toLowerCase()}`);
        }
        
        const result = await response.json();
        return successResponse(result.data || result, `${entityName} created successfully`);
      } catch (error) {
        return errorResponse(error instanceof Error ? error.message : `Failed to create ${entityName.toLowerCase()}`);
      }
    },

    async update(id, data) {
      try {
        const response = await fetch(`${baseUrl}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            return errorResponse(`${entityName} not found`);
          }
          const errorData = await response.json().catch(() => ({}));
          return errorResponse(errorData.message || `Failed to update ${entityName.toLowerCase()}`);
        }
        
        const result = await response.json();
        return successResponse(result.data || result, `${entityName} updated successfully`);
      } catch (error) {
        return errorResponse(error instanceof Error ? error.message : `Failed to update ${entityName.toLowerCase()}`);
      }
    },

    async delete(id) {
      try {
        const response = await fetch(`${baseUrl}/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            return errorResponse(`${entityName} not found`);
          }
          return errorResponse(`Failed to delete ${entityName.toLowerCase()}`);
        }
        
        return successResponse(true, `${entityName} deleted successfully`);
      } catch (error) {
        return errorResponse(error instanceof Error ? error.message : `Failed to delete ${entityName.toLowerCase()}`);
      }
    },
  };
}
