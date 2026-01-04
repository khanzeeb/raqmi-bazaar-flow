// Product Service - Single Responsibility: Business logic only

import { Decimal } from '@prisma/client/runtime/library';
import ProductRepository from '../repositories/ProductRepository';
import { ProductValidator, ValidationError } from '../validators/ProductValidator';
import { CreateProductDTO, UpdateProductDTO } from '../dto/ProductDTO';
import { IProductData, IProductFilters, IPaginatedResponse } from '../interfaces/IProduct';
import { IProductService, IProductStats } from '../interfaces/IService';

class ProductService implements IProductService<IProductData, CreateProductDTO, UpdateProductDTO, IProductFilters> {
  private validator: ProductValidator;

  constructor() {
    this.validator = new ProductValidator();
  }

  /**
   * Get product by ID
   */
  async getById(id: string): Promise<IProductData | null> {
    return ProductRepository.findById(id);
  }

  /**
   * Get all products with filters
   */
  async getAll(filters?: IProductFilters): Promise<IPaginatedResponse<IProductData>> {
    return ProductRepository.findAll(filters || {});
  }

  /**
   * Create new product
   */
  async create(data: CreateProductDTO): Promise<IProductData> {
    // Validate
    this.validator.validateCreate(data);

    // Transform and create
    const { variants, ...productData } = data;
    const transformedData = this.transformCreateData(productData);
    const transformedVariants = variants?.map(v => this.transformVariantData(v));

    return ProductRepository.createWithVariants(transformedData, transformedVariants);
  }

  /**
   * Update existing product
   */
  async update(id: string, data: UpdateProductDTO): Promise<IProductData | null> {
    // Check exists
    const existing = await ProductRepository.findById(id);
    if (!existing) return null;

    // Validate
    this.validator.validateUpdate(data);

    // Transform and update
    const { variants, ...productData } = data;
    const transformedData = this.transformUpdateData(productData);
    const transformedVariants = variants?.map(v => this.transformVariantData(v));

    return ProductRepository.updateWithVariants(id, transformedData, transformedVariants);
  }

  /**
   * Delete product
   */
  async delete(id: string): Promise<boolean> {
    const existing = await ProductRepository.findById(id);
    if (!existing) return false;
    return ProductRepository.delete(id);
  }

  /**
   * Update product stock
   */
  async updateStock(id: string, newStock: number, reason = ''): Promise<IProductData | null> {
    this.validator.validateStockUpdate({ stock: newStock, reason });
    return ProductRepository.updateStock(id, newStock, reason);
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(limit = 10): Promise<IProductData[]> {
    const result = await ProductRepository.findAll({
      stockStatus: 'low-stock',
      limit
    });
    return result.data;
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<string[]> {
    return ProductRepository.getCategories();
  }

  /**
   * Get suppliers
   */
  async getSuppliers(): Promise<string[]> {
    return ProductRepository.getSuppliers();
  }

  /**
   * Get product statistics
   */
  async getStats(): Promise<IProductStats> {
    const [totalProducts, inStock, lowStock, outOfStock] = await Promise.all([
      ProductRepository.count({}),
      ProductRepository.count({ stockStatus: 'in-stock' }),
      ProductRepository.count({ stockStatus: 'low-stock' }),
      ProductRepository.count({ stockStatus: 'out-of-stock' })
    ]);

    return { totalProducts, inStock, lowStock, outOfStock };
  }

  // Private transformation methods (DRY principle)

  private transformCreateData(data: Omit<CreateProductDTO, 'variants'>) {
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

  private transformUpdateData(data: Partial<Omit<UpdateProductDTO, 'variants'>>) {
    const result: any = { ...data };
    
    if (data.price !== undefined) result.price = new Decimal(data.price);
    if (data.cost !== undefined) result.cost = new Decimal(data.cost);
    if (data.weight !== undefined) result.weight = data.weight ? new Decimal(data.weight) : null;
    
    return result;
  }

  private transformVariantData(variant: any) {
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
