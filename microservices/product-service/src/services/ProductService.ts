// Product Service - Business logic for products
import { Decimal } from '@prisma/client/runtime/library';
import { BaseService, IBaseRepository } from '../common/BaseService';
import ProductRepository from '../repositories/ProductRepository';
import { ProductValidator } from '../validators/ProductValidator';
import { CreateProductDTO, UpdateProductDTO } from '../dto/ProductDTO';
import { IProductData, IProductFilters, IPaginatedResponse } from '../interfaces/IProduct';
import { IProductStats } from '../interfaces/IService';

// Extended repository interface for product-specific operations
interface IProductRepository extends IBaseRepository<IProductData, IProductFilters> {
  findByIds(ids: string[]): Promise<IProductData[]>;
  createWithVariants(productData: any, variants?: any[]): Promise<IProductData>;
  updateWithVariants(id: string, productData: any, variants?: any[]): Promise<IProductData | null>;
  updateStock(id: string, newStock: number, reason?: string): Promise<IProductData | null>;
  getCategories(): Promise<string[]>;
  getSuppliers(): Promise<string[]>;
}

class ProductService extends BaseService<
  IProductData,
  CreateProductDTO,
  UpdateProductDTO,
  IProductFilters,
  IProductRepository
> {
  private validator: ProductValidator;

  constructor() {
    super(ProductRepository as IProductRepository);
    this.validator = new ProductValidator();
  }

  /**
   * Override create to handle variants
   */
  async create(data: CreateProductDTO): Promise<IProductData> {
    this.validateCreate(data);
    const { variants, ...productData } = data;
    const transformedData = this.transformCreateData(productData);
    const transformedVariants = variants?.map(v => this.transformVariantData(v));
    return this.repository.createWithVariants(transformedData, transformedVariants);
  }

  /**
   * Override update to handle variants
   */
  async update(id: string, data: UpdateProductDTO): Promise<IProductData | null> {
    const existing = await this.repository.findById(id);
    if (!existing) return null;

    this.validateUpdate(data);
    const { variants, ...productData } = data;
    const transformedData = this.transformUpdateData(productData);
    const transformedVariants = variants?.map(v => this.transformVariantData(v));
    return this.repository.updateWithVariants(id, transformedData, transformedVariants);
  }

  /**
   * Update product stock
   */
  async updateStock(id: string, newStock: number, reason = ''): Promise<IProductData | null> {
    this.validator.validateStockUpdate({ stock: newStock, reason });
    return this.repository.updateStock(id, newStock, reason);
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(limit = 10): Promise<IProductData[]> {
    const result = await this.repository.findAll({
      stockStatus: 'low-stock',
      limit
    });
    return result.data;
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<string[]> {
    return this.repository.getCategories();
  }

  /**
   * Get suppliers
   */
  async getSuppliers(): Promise<string[]> {
    return this.repository.getSuppliers();
  }

  /**
   * Get product statistics
   */
  async getStats(): Promise<IProductStats> {
    const [totalProducts, inStock, lowStock, outOfStock] = await Promise.all([
      this.repository.count({}),
      this.repository.count({ stockStatus: 'in-stock' }),
      this.repository.count({ stockStatus: 'low-stock' }),
      this.repository.count({ stockStatus: 'out-of-stock' })
    ]);

    return { totalProducts, inStock, lowStock, outOfStock };
  }

  // Protected overrides for validation and transformation

  protected validateCreate(data: CreateProductDTO): void {
    this.validator.validateCreate(data);
  }

  protected validateUpdate(data: UpdateProductDTO): void {
    this.validator.validateUpdate(data);
  }

  protected transformCreateData(data: Omit<CreateProductDTO, 'variants'>): any {
    return {
      ...data,
      price: new Decimal(data.price),
      cost: new Decimal(data.cost),
      weight: data.weight ? new Decimal(data.weight) : null,
      images: data.images || [],
      dimensions: data.dimensions || null,
      tags: data.tags || []
    };
  }

  protected transformUpdateData(data: Partial<Omit<UpdateProductDTO, 'variants'>>): any {
    const result: any = { ...data };
    
    if (data.price !== undefined) result.price = new Decimal(data.price);
    if (data.cost !== undefined) result.cost = new Decimal(data.cost);
    if (data.weight !== undefined) result.weight = data.weight ? new Decimal(data.weight) : null;
    
    return result;
  }

  private transformVariantData(variant: any): any {
    return {
      ...variant,
      price: new Decimal(variant.price),
      cost: new Decimal(variant.cost),
      weight: variant.weight ? new Decimal(variant.weight) : null,
      images: variant.images || [],
      dimensions: variant.dimensions || null,
      attributes: variant.attributes || {}
    };
  }
}

export default new ProductService();
