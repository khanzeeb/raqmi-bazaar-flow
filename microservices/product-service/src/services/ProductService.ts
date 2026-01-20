// Product Service - Business logic for products
import { BaseService, IBaseRepository } from '../common/BaseService';
import ProductRepository from '../repositories/ProductRepository';
import { ProductValidator } from '../validators/ProductValidator';
import { productTransformer } from '../transformers';
import { CreateProductDTO, UpdateProductDTO } from '../dto';
import { IProductData, IProductFilters } from '../interfaces/IProduct';
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
    const transformedData = productTransformer.forCreate(productData as CreateProductDTO);
    const transformedVariants = productTransformer.forVariants(variants);
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
    const transformedData = productTransformer.forUpdate(productData);
    const transformedVariants = productTransformer.forVariants(variants);
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

  // Protected overrides for validation

  protected validateCreate(data: CreateProductDTO): void {
    this.validator.validateCreate(data);
  }

  protected validateUpdate(data: UpdateProductDTO): void {
    this.validator.validateUpdate(data);
  }
}

export default new ProductService();
