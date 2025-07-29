import { BaseApiService } from './base.service';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api';
import { Product, CreateProductRequest, UpdateProductRequest, ProductFilters } from '@/types/product';

// Dummy data for products
const DUMMY_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Smartphone Pro Max',
    sku: 'SPM-001',
    category: 'Electronics',
    price: 999.99,
    cost: 600.00,
    stock: 50,
    minStock: 10,
    maxStock: 100,
    status: 'active',
    image: '/placeholder.svg',
    description: 'Latest flagship smartphone with advanced features',
    shortDescription: 'Premium smartphone',
    supplier: 'TechCorp',
    barcode: '1234567890123',
    weight: 0.2,
    dimensions: { length: 15, width: 7, height: 0.8 },
    tags: ['mobile', 'premium', 'smartphone'],
    variants: [
      { id: 'var-001', name: 'Color', value: 'Black', priceModifier: 0, stock: 25 },
      { id: 'var-002', name: 'Color', value: 'White', priceModifier: 0, stock: 25 },
      { id: 'var-003', name: 'Storage', value: '128GB', priceModifier: 0, stock: 30 },
      { id: 'var-004', name: 'Storage', value: '256GB', priceModifier: 100, stock: 20 },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'prod-002',
    name: 'Wireless Headphones',
    sku: 'WH-002',
    category: 'Electronics',
    price: 199.99,
    cost: 120.00,
    stock: 75,
    minStock: 15,
    maxStock: 150,
    status: 'active',
    image: '/placeholder.svg',
    description: 'Premium wireless headphones with noise cancellation',
    shortDescription: 'Noise-cancelling headphones',
    supplier: 'AudioTech',
    barcode: '2345678901234',
    weight: 0.3,
    dimensions: { length: 20, width: 18, height: 8 },
    tags: ['audio', 'wireless', 'premium'],
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
  },
  {
    id: 'prod-003',
    name: 'Gaming Laptop',
    sku: 'GL-003',
    category: 'Computers',
    price: 1499.99,
    cost: 900.00,
    stock: 5,
    minStock: 5,
    maxStock: 25,
    status: 'active',
    image: '/placeholder.svg',
    description: 'High-performance gaming laptop with RTX graphics',
    shortDescription: 'Gaming laptop',
    supplier: 'GameTech',
    barcode: '3456789012345',
    weight: 2.5,
    dimensions: { length: 35, width: 25, height: 2 },
    tags: ['gaming', 'laptop', 'high-performance'],
    createdAt: '2024-01-05T11:30:00Z',
    updatedAt: '2024-01-22T10:15:00Z',
  },
  {
    id: 'prod-004',
    name: 'Office Chair',
    sku: 'OC-004',
    category: 'Furniture',
    price: 299.99,
    cost: 180.00,
    stock: 0,
    minStock: 5,
    maxStock: 30,
    status: 'active',
    image: '/placeholder.svg',
    description: 'Ergonomic office chair with lumbar support',
    shortDescription: 'Ergonomic office chair',
    supplier: 'FurniCorp',
    barcode: '4567890123456',
    weight: 15.0,
    dimensions: { length: 70, width: 70, height: 120 },
    tags: ['furniture', 'office', 'ergonomic'],
    createdAt: '2024-01-08T13:20:00Z',
    updatedAt: '2024-01-25T09:30:00Z',
  },
  {
    id: 'prod-005',
    name: 'Coffee Maker',
    sku: 'CM-005',
    category: 'Appliances',
    price: 89.99,
    cost: 50.00,
    stock: 30,
    minStock: 8,
    maxStock: 60,
    status: 'active',
    image: '/placeholder.svg',
    description: 'Programmable coffee maker with thermal carafe',
    shortDescription: 'Programmable coffee maker',
    supplier: 'KitchenTech',
    barcode: '5678901234567',
    weight: 3.2,
    dimensions: { length: 25, width: 20, height: 35 },
    tags: ['appliance', 'kitchen', 'coffee'],
    createdAt: '2024-01-12T15:45:00Z',
    updatedAt: '2024-01-19T12:00:00Z',
  },
];

export class ProductApiService extends BaseApiService {
  private products: Product[] = [...DUMMY_PRODUCTS];

  constructor() {
    super('/api/products');
  }

  async getProducts(params?: QueryParams & { filters?: ProductFilters }): Promise<ApiResponse<PaginatedResponse<Product>>> {
    try {
      await this.simulateApiDelay();

      let filteredProducts = [...this.products];

      // Apply search filter
      if (params?.search) {
        const searchTerm = params.search.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.sku.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm)
        );
      }

      // Apply filters
      if (params?.filters) {
        const { category, status, stockStatus, priceRange, supplier } = params.filters;

        if (category) {
          filteredProducts = filteredProducts.filter(p => p.category === category);
        }

        if (status) {
          filteredProducts = filteredProducts.filter(p => p.status === status);
        }

        if (stockStatus) {
          filteredProducts = filteredProducts.filter(p => {
            if (stockStatus === 'out-of-stock') return p.stock === 0;
            if (stockStatus === 'low-stock') return p.stock > 0 && p.stock <= p.minStock;
            if (stockStatus === 'in-stock') return p.stock > p.minStock;
            return true;
          });
        }

        if (priceRange) {
          filteredProducts = filteredProducts.filter(p =>
            p.price >= priceRange.min && p.price <= priceRange.max
          );
        }

        if (supplier) {
          filteredProducts = filteredProducts.filter(p => p.supplier === supplier);
        }
      }

      // Apply sorting
      if (params?.sortBy) {
        const sortOrder = params.sortOrder || 'asc';
        filteredProducts.sort((a, b) => {
          const aValue = (a as any)[params.sortBy!];
          const bValue = (b as any)[params.sortBy!];
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortOrder === 'asc' 
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          }
          
          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
          }
          
          return 0;
        });
      }

      // Apply pagination
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      const response: PaginatedResponse<Product> = {
        data: paginatedProducts,
        total: filteredProducts.length,
        page,
        limit,
        totalPages: Math.ceil(filteredProducts.length / limit),
      };

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch products',
      };
    }
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    try {
      await this.simulateApiDelay();

      const product = this.products.find(p => p.id === id);
      
      if (!product) {
        return {
          success: false,
          error: 'Product not found',
        };
      }

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch product',
      };
    }
  }

  async createProduct(productData: CreateProductRequest): Promise<ApiResponse<Product>> {
    try {
      await this.simulateApiDelay();

      // Check if SKU already exists
      const existingProduct = this.products.find(p => p.sku === productData.sku);
      if (existingProduct) {
        return {
          success: false,
          error: 'Product with this SKU already exists',
        };
      }

      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        ...productData,
        status: 'active',
        variants: productData.variants?.map((variant, index) => ({
          ...variant,
          id: `var-${Date.now()}-${index}`,
        })) || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.products.push(newProduct);

      return {
        success: true,
        data: newProduct,
        message: 'Product created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create product',
      };
    }
  }

  async updateProduct(productData: UpdateProductRequest): Promise<ApiResponse<Product>> {
    try {
      await this.simulateApiDelay();

      const productIndex = this.products.findIndex(p => p.id === productData.id);
      
      if (productIndex === -1) {
        return {
          success: false,
          error: 'Product not found',
        };
      }

      // Check if SKU already exists (excluding current product)
      if (productData.sku) {
        const existingProduct = this.products.find(p => p.sku === productData.sku && p.id !== productData.id);
        if (existingProduct) {
          return {
            success: false,
            error: 'Product with this SKU already exists',
          };
        }
      }

      const updatedProduct: Product = {
        ...this.products[productIndex],
        ...productData,
        variants: productData.variants?.map((variant, index) => ({
          ...variant,
          id: `var-${Date.now()}-${index}`,
        })) || this.products[productIndex].variants,
        updatedAt: new Date().toISOString(),
      };

      this.products[productIndex] = updatedProduct;

      return {
        success: true,
        data: updatedProduct,
        message: 'Product updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update product',
      };
    }
  }

  async deleteProduct(id: string): Promise<ApiResponse<boolean>> {
    try {
      await this.simulateApiDelay();

      const productIndex = this.products.findIndex(p => p.id === id);
      
      if (productIndex === -1) {
        return {
          success: false,
          error: 'Product not found',
        };
      }

      this.products.splice(productIndex, 1);

      return {
        success: true,
        data: true,
        message: 'Product deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete product',
      };
    }
  }

  async getCategories(): Promise<ApiResponse<string[]>> {
    try {
      await this.simulateApiDelay();
      
      const categories = [...new Set(this.products.map(p => p.category))];
      
      return {
        success: true,
        data: categories,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch categories',
      };
    }
  }

  async getSuppliers(): Promise<ApiResponse<string[]>> {
    try {
      await this.simulateApiDelay();
      
      const suppliers = [...new Set(this.products.map(p => p.supplier).filter(Boolean))] as string[];
      
      return {
        success: true,
        data: suppliers,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch suppliers',
      };
    }
  }

  private async simulateApiDelay(): Promise<void> {
    const delay = Math.random() * 200 + 100;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Export singleton instance
export const productApiService = new ProductApiService();