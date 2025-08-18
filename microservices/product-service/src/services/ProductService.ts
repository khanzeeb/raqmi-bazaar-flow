import { BaseService } from '../common/BaseService';
import { IProductService } from '../interfaces/IService';
import ProductRepository from '../models/Product';
import { ProductData, ProductFilters } from '../models/Product';

export interface CreateProductDTO {
  name: string;
  sku: string;
  category?: string;
  category_id?: string;
  price: number;
  cost: number;
  stock?: number;
  min_stock?: number;
  max_stock?: number;
  image?: string;
  description?: string;
  short_description?: string;
  supplier?: string;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
  variants?: any[];
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}

class ProductService extends BaseService<ProductData, CreateProductDTO, UpdateProductDTO, ProductFilters> implements IProductService {
  constructor() {
    super(ProductRepository);
  }

  protected async validateCreateData(data: CreateProductDTO): Promise<any> {
    // Add business validation logic here
    if (data.price <= 0) {
      throw new Error('Price must be greater than 0');
    }
    
    if (data.cost < 0) {
      throw new Error('Cost cannot be negative');
    }
    
    return data;
  }

  protected async validateUpdateData(data: UpdateProductDTO): Promise<any> {
    // Add business validation logic here
    if (data.price !== undefined && data.price <= 0) {
      throw new Error('Price must be greater than 0');
    }
    
    if (data.cost !== undefined && data.cost < 0) {
      throw new Error('Cost cannot be negative');
    }
    
    return data;
  }

  async updateStock(id: string, newStock: number, reason = ''): Promise<ProductData | null> {
    if (newStock < 0) {
      throw new Error('Stock cannot be negative');
    }
    
    return await ProductRepository.updateStock(id, newStock, reason);
  }

  async getLowStockProducts(limit = 10): Promise<ProductData[]> {
    const result = await ProductRepository.findAll({
      stockStatus: 'low-stock',
      limit
    });
    
    return result.data;
  }

  async getCategories(): Promise<string[]> {
    return await ProductRepository.getCategories();
  }

  async getSuppliers(): Promise<string[]> {
    return await ProductRepository.getSuppliers();
  }
}

export default new ProductService();