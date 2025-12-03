// Product Gateway - API layer for products (Interface Segregation)

import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api';
import { Product, CreateProductDTO, UpdateProductDTO, ProductFilters } from '@/types/product.types';

const API_BASE_URL = 'http://localhost:3001/api/products';

// Product Gateway Interface (Dependency Inversion)
export interface IProductGateway {
  getAll(params?: QueryParams & { filters?: ProductFilters }): Promise<ApiResponse<PaginatedResponse<Product>>>;
  getById(id: string): Promise<ApiResponse<Product>>;
  create(data: CreateProductDTO): Promise<ApiResponse<Product>>;
  update(data: UpdateProductDTO): Promise<ApiResponse<Product>>;
  delete(id: string): Promise<ApiResponse<boolean>>;
  getCategories(): Promise<ApiResponse<string[]>>;
  getSuppliers(): Promise<ApiResponse<string[]>>;
}

// Build query string from params
const buildQueryString = (params?: QueryParams & { filters?: ProductFilters }): string => {
  if (!params) return '';
  
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));
  if (params.search) searchParams.append('search', params.search);
  if (params.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
  
  if (params.filters) {
    if (params.filters.category) searchParams.append('category', params.filters.category);
    if (params.filters.status) searchParams.append('status', params.filters.status);
    if (params.filters.stockStatus) searchParams.append('stockStatus', params.filters.stockStatus);
    if (params.filters.supplier) searchParams.append('supplier', params.filters.supplier);
    if (params.filters.priceRange) {
      searchParams.append('minPrice', String(params.filters.priceRange.min));
      searchParams.append('maxPrice', String(params.filters.priceRange.max));
    }
  }
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Product Gateway Implementation
export const productGateway: IProductGateway = {
  async getAll(params) {
    try {
      const queryString = buildQueryString(params);
      const response = await fetch(`${API_BASE_URL}${queryString}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        data: {
          data: data.data || data,
          total: data.total || data.length || 0,
          page: data.page || params?.page || 1,
          limit: data.limit || params?.limit || 10,
          totalPages: data.totalPages || Math.ceil((data.total || data.length || 0) / (params?.limit || 10)),
        },
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products',
      };
    }
  },

  async getById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'Product not found' };
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch product',
      };
    }
  },

  async create(data) {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return { success: true, data: result, message: 'Product created successfully' };
    } catch (error) {
      console.error('Error creating product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create product',
      };
    }
  },

  async update(data) {
    try {
      const { id, ...updateData } = data;
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'Product not found' };
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return { success: true, data: result, message: 'Product updated successfully' };
    } catch (error) {
      console.error('Error updating product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update product',
      };
    }
  },

  async delete(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'Product not found' };
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return { success: true, data: true, message: 'Product deleted successfully' };
    } catch (error) {
      console.error('Error deleting product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete product',
      };
    }
  },

  async getCategories() {
    try {
      // Categories endpoint - adjust if your backend has a different path
      const response = await fetch(`${API_BASE_URL}?limit=1000`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const products = data.data || data;
      const categories = [...new Set(products.map((p: Product) => p.category).filter(Boolean))] as string[];
      
      return { success: true, data: categories };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch categories',
      };
    }
  },

  async getSuppliers() {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, data: data.data || data };
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch suppliers',
      };
    }
  },
};
