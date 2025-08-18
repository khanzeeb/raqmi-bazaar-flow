import { BaseService } from '../common/BaseService';
import { IProductVariantService } from '../interfaces/IService';
import ProductVariantRepository from '../models/ProductVariant';
import { ProductVariantData, ProductVariantFilters } from '../models/ProductVariant';

export interface CreateProductVariantDTO {
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost: number;
  stock?: number;
  min_stock?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  attributes?: Record<string, any>;
  image?: string;
  images?: string[];
  status?: 'active' | 'inactive';
  sort_order?: number;
}

export interface UpdateProductVariantDTO extends Partial<CreateProductVariantDTO> {}

class ProductVariantService extends BaseService<ProductVariantData, CreateProductVariantDTO, UpdateProductVariantDTO, ProductVariantFilters> implements IProductVariantService {
  constructor() {
    super(ProductVariantRepository);
  }

  protected async validateCreateData(data: CreateProductVariantDTO): Promise<any> {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Variant name is required');
    }
    
    if (data.price <= 0) {
      throw new Error('Variant price must be greater than 0');
    }
    
    if (data.cost < 0) {
      throw new Error('Variant cost cannot be negative');
    }
    
    return data;
  }

  protected async validateUpdateData(data: UpdateProductVariantDTO): Promise<any> {
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new Error('Variant name cannot be empty');
    }
    
    if (data.price !== undefined && data.price <= 0) {
      throw new Error('Variant price must be greater than 0');
    }
    
    if (data.cost !== undefined && data.cost < 0) {
      throw new Error('Variant cost cannot be negative');
    }
    
    return data;
  }

  async getByProductId(productId: string): Promise<ProductVariantData[]> {
    return await ProductVariantRepository.findByProductId(productId);
  }

  async createForProduct(productId: string, data: CreateProductVariantDTO): Promise<ProductVariantData> {
    const validatedData = await this.validateCreateData(data);
    return await ProductVariantRepository.create({
      ...validatedData,
      product_id: productId
    });
  }
}

export default new ProductVariantService();