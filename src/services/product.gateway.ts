// Product Gateway - API layer for products (Interface Segregation)

import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api';
import { Product, CreateProductDTO, UpdateProductDTO, ProductFilters } from '@/types/product.types';

const API_BASE_URL = 'http://localhost:3001/api/products';

// Static fallback data when backend is unavailable
const STATIC_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'MacBook Pro 14"',
    nameAr: 'ماك بوك برو 14 بوصة',
    sku: 'MBP-14-001',
    category: 'Laptops',
    category_id: '2',
    price: 7499,
    cost: 6000,
    stock: 25,
    min_stock: 5,
    max_stock: 100,
    status: 'active',
    image: '/placeholder.svg',
    description: 'Apple MacBook Pro with M3 Pro chip',
    barcode: '1234567890123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'iPhone 15 Pro',
    nameAr: 'آيفون 15 برو',
    sku: 'IPH-15P-001',
    category: 'Smartphones',
    category_id: '3',
    price: 4199,
    cost: 3200,
    stock: 50,
    min_stock: 10,
    max_stock: 200,
    status: 'active',
    image: '/placeholder.svg',
    description: 'Apple iPhone 15 Pro with A17 Pro chip',
    barcode: '1234567890124',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Office Desk Chair',
    nameAr: 'كرسي مكتب',
    sku: 'CHR-OFF-001',
    category: 'Office Chairs',
    category_id: '5',
    price: 899,
    cost: 500,
    stock: 15,
    min_stock: 5,
    max_stock: 50,
    status: 'active',
    image: '/placeholder.svg',
    description: 'Ergonomic office chair with lumbar support',
    barcode: '1234567890125',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Samsung Galaxy S24',
    nameAr: 'سامسونج جالاكسي S24',
    sku: 'SAM-S24-001',
    category: 'Smartphones',
    category_id: '3',
    price: 3499,
    cost: 2600,
    stock: 3,
    min_stock: 10,
    max_stock: 150,
    status: 'active',
    image: '/placeholder.svg',
    description: 'Samsung Galaxy S24 with AI features',
    barcode: '1234567890126',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Dell XPS 15',
    nameAr: 'ديل XPS 15',
    sku: 'DEL-XPS-001',
    category: 'Laptops',
    category_id: '2',
    price: 5999,
    cost: 4500,
    stock: 0,
    min_stock: 5,
    max_stock: 50,
    status: 'active',
    image: '/placeholder.svg',
    description: 'Dell XPS 15 with Intel Core i9',
    barcode: '1234567890127',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let localProducts = [...STATIC_PRODUCTS];

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
      console.warn('API unavailable, using local data:', error);
      
      // Use local fallback data
      let filtered = [...localProducts];
      
      // Apply search filter
      if (params?.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(search) || 
          p.sku.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search)
        );
      }
      
      // Apply filters
      if (params?.filters) {
        if (params.filters.category) {
          filtered = filtered.filter(p => p.category === params.filters!.category);
        }
        if (params.filters.status) {
          filtered = filtered.filter(p => p.status === params.filters!.status);
        }
      }
      
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const start = (page - 1) * limit;
      const paginatedData = filtered.slice(start, start + limit);
      
      return {
        success: true,
        data: {
          data: paginatedData,
          total: filtered.length,
          page,
          limit,
          totalPages: Math.ceil(filtered.length / limit),
        },
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
