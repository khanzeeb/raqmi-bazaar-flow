// Product Variant Service - Business logic for product variants
import { ProductVariant } from '@prisma/client';
import { BaseService, IBaseRepository } from '../common/BaseService';
import ProductVariantRepository, { VariantFilters } from '../repositories/ProductVariantRepository';
import { variantTransformer, VariantData, VariantCreateInput } from '../transformers';
import { VariantValidator } from '../validators';
import { IPaginatedResponse } from '../interfaces/IProduct';

export interface CreateVariantDTO extends VariantCreateInput {}
export interface UpdateVariantDTO extends Partial<VariantCreateInput> {}

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
  private validator: VariantValidator;

  constructor() {
    super(ProductVariantRepository as IVariantRepository);
    this.validator = new VariantValidator();
  }

  /**
   * Override getById to transform the response
   */
  async getById(id: string): Promise<VariantData | null> {
    const variant = await this.repository.findById(id);
    return variant ? variantTransformer.toResponse(variant) : null;
  }

  /**
   * Override getAll to transform responses
   */
  async getAll(filters?: VariantFilters): Promise<IPaginatedResponse<VariantData>> {
    const result = await this.repository.findAll(filters || {} as VariantFilters);
    return {
      ...result,
      data: variantTransformer.toResponseList(result.data)
    };
  }

  /**
   * Get variants by product ID
   */
  async getByProductId(productId: string): Promise<VariantData[]> {
    const variants = await this.repository.findByProductId(productId);
    return variantTransformer.toResponseList(variants);
  }

  /**
   * Create variant for a specific product
   */
  async createForProduct(productId: string, data: CreateVariantDTO): Promise<VariantData> {
    this.validateCreate(data);
    const transformedData = variantTransformer.forCreate(data);
    const variant = await this.repository.createForProduct(productId, transformedData);
    return variantTransformer.toResponse(variant);
  }

  /**
   * Override update to transform response
   */
  async update(id: string, data: UpdateVariantDTO): Promise<VariantData | null> {
    const existing = await this.repository.findById(id);
    if (!existing) return null;

    this.validateUpdate(data);
    const transformedData = variantTransformer.forUpdate(data);
    const result = await this.repository.update(id, transformedData);
    return result ? variantTransformer.toResponse(result) : null;
  }

  // Validation overrides

  protected validateCreate(data: CreateVariantDTO): void {
    this.validator.validateCreate(data);
  }

  protected validateUpdate(data: UpdateVariantDTO): void {
    this.validator.validateUpdate(data);
  }
}

export default new ProductVariantService();
