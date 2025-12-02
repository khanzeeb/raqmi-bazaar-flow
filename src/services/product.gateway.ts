// Product Gateway - API layer for products (Interface Segregation)

import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api';
import { Product, CreateProductDTO, UpdateProductDTO, ProductFilters } from '@/types/product.types';

// Dummy data for development
const DUMMY_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Smartphone Pro Max',
    sku: 'SPM-001',
    category: 'Electronics',
    price: 999.99,
    cost: 600.00,
    stock: 50,
    min_stock: 10,
    max_stock: 100,
    status: 'active',
    image: '/placeholder.svg',
    description: 'Latest flagship smartphone with advanced features',
    short_description: 'Premium smartphone',
    supplier: 'TechCorp',
    barcode: '1234567890123',
    weight: 0.2,
    dimensions: { length: 15, width: 7, height: 0.8 },
    tags: ['mobile', 'premium', 'smartphone'],
    variants: [
      { id: 'var-001', name: 'Black', price: 999.99, cost: 600.00, stock: 25, attributes: { color: 'Black' } },
      { id: 'var-002', name: 'White', price: 999.99, cost: 600.00, stock: 25, attributes: { color: 'White' } },
    ],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z',
  },
  {
    id: 'prod-002',
    name: 'Wireless Headphones',
    sku: 'WH-002',
    category: 'Electronics',
    price: 199.99,
    cost: 120.00,
    stock: 75,
    min_stock: 15,
    max_stock: 150,
    status: 'active',
    image: '/placeholder.svg',
    supplier: 'AudioTech',
    barcode: '2345678901234',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-18T16:45:00Z',
  },
  {
    id: 'prod-003',
    name: 'Gaming Laptop',
    sku: 'GL-003',
    category: 'Computers',
    price: 1499.99,
    cost: 900.00,
    stock: 5,
    min_stock: 5,
    max_stock: 25,
    status: 'active',
    image: '/placeholder.svg',
    supplier: 'GameTech',
    barcode: '3456789012345',
    created_at: '2024-01-05T11:30:00Z',
    updated_at: '2024-01-22T10:15:00Z',
  },
  {
    id: 'prod-004',
    name: 'Office Chair',
    sku: 'OC-004',
    category: 'Furniture',
    price: 299.99,
    cost: 180.00,
    stock: 0,
    min_stock: 5,
    max_stock: 30,
    status: 'active',
    image: '/placeholder.svg',
    supplier: 'FurniCorp',
    barcode: '4567890123456',
    created_at: '2024-01-08T13:20:00Z',
    updated_at: '2024-01-25T09:30:00Z',
  },
  {
    id: 'prod-005',
    name: 'Coffee Maker',
    sku: 'CM-005',
    category: 'Appliances',
    price: 89.99,
    cost: 50.00,
    stock: 30,
    min_stock: 8,
    max_stock: 60,
    status: 'active',
    image: '/placeholder.svg',
    supplier: 'KitchenTech',
    barcode: '5678901234567',
    created_at: '2024-01-12T15:45:00Z',
    updated_at: '2024-01-19T12:00:00Z',
  },
];

// Simulate API delay
const delay = (ms: number = 150) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory store for demo
let products = [...DUMMY_PRODUCTS];

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

// Product Gateway Implementation
export const productGateway: IProductGateway = {
  async getAll(params) {
    await delay();

    let filtered = [...products];

    // Search filter
    if (params?.search) {
      const term = params.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
      );
    }

    // Apply filters
    if (params?.filters) {
      const { category, status, stockStatus, priceRange, supplier } = params.filters;

      if (category) filtered = filtered.filter(p => p.category === category);
      if (status) filtered = filtered.filter(p => p.status === status);
      if (supplier) filtered = filtered.filter(p => p.supplier === supplier);
      if (priceRange) {
        filtered = filtered.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);
      }
      if (stockStatus) {
        filtered = filtered.filter(p => {
          if (stockStatus === 'out-of-stock') return p.stock === 0;
          if (stockStatus === 'low-stock') return p.stock > 0 && p.stock <= p.min_stock;
          if (stockStatus === 'in-stock') return p.stock > p.min_stock;
          return true;
        });
      }
    }

    // Sorting
    if (params?.sortBy) {
      const order = params.sortOrder || 'asc';
      const sortKey = params.sortBy as keyof Product;
      filtered.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return order === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }

    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      success: true,
      data: {
        data: paginated,
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      },
    };
  },

  async getById(id) {
    await delay();
    const product = products.find(p => p.id === id);
    
    if (!product) {
      return { success: false, error: 'Product not found' };
    }
    
    return { success: true, data: product };
  },

  async create(data) {
    await delay();

    if (products.find(p => p.sku === data.sku)) {
      return { success: false, error: 'Product with this SKU already exists' };
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      ...data,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    products.push(newProduct);
    return { success: true, data: newProduct, message: 'Product created successfully' };
  },

  async update(data) {
    await delay();

    const index = products.findIndex(p => p.id === data.id);
    if (index === -1) {
      return { success: false, error: 'Product not found' };
    }

    if (data.sku) {
      const existing = products.find(p => p.sku === data.sku && p.id !== data.id);
      if (existing) {
        return { success: false, error: 'Product with this SKU already exists' };
      }
    }

    products[index] = {
      ...products[index],
      ...data,
      updated_at: new Date().toISOString(),
    };

    return { success: true, data: products[index], message: 'Product updated successfully' };
  },

  async delete(id) {
    await delay();

    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      return { success: false, error: 'Product not found' };
    }

    products.splice(index, 1);
    return { success: true, data: true, message: 'Product deleted successfully' };
  },

  async getCategories() {
    await delay();
    const categories = [...new Set(products.map(p => p.category))];
    return { success: true, data: categories };
  },

  async getSuppliers() {
    await delay();
    const suppliers = [...new Set(products.map(p => p.supplier).filter(Boolean))] as string[];
    return { success: true, data: suppliers };
  },
};
