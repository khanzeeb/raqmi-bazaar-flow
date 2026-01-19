// Product Variant Service - Business logic for product variants
import { ProductVariant } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { BaseService, IBaseRepository } from '../common/BaseService';
import ProductVariantRepository, { VariantFilters } from '../repositories/ProductVariantRepository';
import { IPaginatedResponse } from '../interfaces/IProduct';

export interface CreateVariantDTO {
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost: number;
  stock?: number;
  min_stock?: number;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  attributes?: Record<string, any>;
  image?: string;
  images?: string[];
  status?: 'active' | 'inactive';
  sort_order?: number;
}

export interface UpdateVariantDTO extends Partial<CreateVariantDTO> {}

// Transformed variant data for API responses
interface VariantData {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  weight: number | null;
  dimensions: any;
  attributes: any;
  images: string[];
  status: string;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

// Extended repository interface for variant-specific operations
interface IVariantRepository extends IBaseRepository<ProductVariant, VariantFilters> {
  findByProductId(productId: string): Promise<ProductVariant[]>;
  createForProduct(productId: string, data: any): Promise<ProductVariant>;
  updateStock(id: string, newStock: number, reason?: string): Promise<ProductVariant | null>;
}

class ProductVariantService extends BaseService<
  ProductVariant,
  CreateVariantDTO,
  UpdateVariantDTO,
  VariantFilters,
  IVariantRepository
> {
  constructor() {
    super(ProductVariantRepository as IVariantRepository);
  }

  /**
   * Override getById to transform the response
   */
  async getById(id: string): Promise<VariantData | null> {
    const variant = await this.repository.findById(id);
    return variant ? this.transformVariant(variant) : null;
  }

  /**
   * Override getAll to transform responses
   */
  async getAll(filters?: VariantFilters): Promise<IPaginatedResponse<VariantData>> {
    const result = await this.repository.findAll(filters || {} as VariantFilters);
    return {
      ...result,
      data: result.data.map(variant => this.transformVariant(variant))
    };
  }

  /**
   * Get variants by product ID
   */
  async getByProductId(productId: string): Promise<VariantData[]> {
    const variants = await this.repository.findByProductId(productId);
    return variants.map(variant => this.transformVariant(variant));
  }

  /**
   * Create variant for a specific product
   */
  async createForProduct(productId: string, data: CreateVariantDTO): Promise<VariantData> {
    this.validateCreate(data);
    const transformedData = this.transformCreateData(data);
    const variant = await this.repository.createForProduct(productId, transformedData);
    return this.transformVariant(variant);
  }

  /**
   * Override update to transform response
   */
  async update(id: string, data: UpdateVariantDTO): Promise<VariantData | null> {
    const result = await super.update(id, data);
    return result ? this.transformVariant(result) : null;
  }

  // Validation overrides

  protected validateCreate(data: CreateVariantDTO): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Variant name is required');
    }
    if (data.price <= 0) {
      throw new Error('Variant price must be greater than 0');
    }
    if (data.cost < 0) {
      throw new Error('Variant cost cannot be negative');
    }
  }

  protected validateUpdate(data: UpdateVariantDTO): void {
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new Error('Variant name cannot be empty');
    }
    if (data.price !== undefined && data.price <= 0) {
      throw new Error('Variant price must be greater than 0');
    }
    if (data.cost !== undefined && data.cost < 0) {
      throw new Error('Variant cost cannot be negative');
    }
  }

  // Transform overrides

  protected transformCreateData(data: CreateVariantDTO): any {
    return {
      ...data,
      price: new Decimal(data.price),
      cost: new Decimal(data.cost),
      weight: data.weight ? new Decimal(data.weight) : null,
      images: data.images || [],
      dimensions: data.dimensions || null,
      attributes: data.attributes || {}
    };
  }

  protected transformUpdateData(data: UpdateVariantDTO): any {
    const result: any = { ...data };
    
    if (data.price !== undefined) result.price = new Decimal(data.price);
    if (data.cost !== undefined) result.cost = new Decimal(data.cost);
    if (data.weight !== undefined) result.weight = data.weight ? new Decimal(data.weight) : null;
    
    return result;
  }

  /**
   * Transform database variant to API response format
   */
  private transformVariant(variant: ProductVariant): VariantData {
    return {
      id: variant.id,
      product_id: variant.product_id,
      name: variant.name,
      sku: variant.sku,
      barcode: variant.barcode,
      price: variant.price ? Number(variant.price) : 0,
      cost: variant.cost ? Number(variant.cost) : 0,
      stock: variant.stock ?? 0,
      min_stock: variant.min_stock ?? 0,
      weight: variant.weight ? Number(variant.weight) : null,
      dimensions: variant.dimensions,
      attributes: variant.attributes ?? {},
      images: (variant.images as string[]) ?? [],
      status: variant.status,
      sort_order: variant.sort_order ?? 0,
      created_at: variant.created_at,
      updated_at: variant.updated_at
    };
  }
}

export default new ProductVariantService();
