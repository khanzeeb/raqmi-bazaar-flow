// Product Category Service - Business logic for categories
import { ProductCategory } from '@prisma/client';
import { BaseService, IBaseRepository } from '../common/BaseService';
import ProductCategoryRepository, { CategoryFilters } from '../repositories/ProductCategoryRepository';
import { categoryTransformer, CategoryData, CategoryCreateInput } from '../transformers';
import { CategoryValidator } from '../validators';

export interface CreateCategoryDTO extends CategoryCreateInput {}
export interface UpdateCategoryDTO extends Partial<CategoryCreateInput> {}

// Extended repository interface for category-specific operations
interface ICategoryRepository extends IBaseRepository<CategoryData, CategoryFilters> {
  getTree(): Promise<CategoryData[]>;
}

class ProductCategoryService extends BaseService<
  CategoryData,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategoryFilters,
  ICategoryRepository
> {
  private validator: CategoryValidator;

  constructor() {
    super(ProductCategoryRepository as ICategoryRepository);
    this.validator = new CategoryValidator();
  }

  /**
   * Override create to use transformer
   */
  async create(data: CreateCategoryDTO): Promise<CategoryData> {
    this.validateCreate(data);
    const transformedData = categoryTransformer.forCreate(data);
    return this.repository.create(transformedData);
  }

  /**
   * Override update to use transformer
   */
  async update(id: string, data: UpdateCategoryDTO): Promise<CategoryData | null> {
    const existing = await this.repository.findById(id);
    if (!existing) return null;

    this.validateUpdate(data);
    const transformedData = categoryTransformer.forUpdate(data);
    return this.repository.update(id, transformedData);
  }

  /**
   * Get category tree structure
   */
  async getTree(): Promise<CategoryData[]> {
    return this.repository.getTree();
  }

  // Validation overrides

  protected validateCreate(data: CreateCategoryDTO): void {
    this.validator.validateCreate(data);
  }

  protected validateUpdate(data: UpdateCategoryDTO): void {
    this.validator.validateUpdate(data);
  }
}

export default new ProductCategoryService();
