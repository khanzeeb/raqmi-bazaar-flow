// Product Category Service - Business logic for categories
import { ProductCategory } from '@prisma/client';
import { BaseService, IBaseRepository } from '../common/BaseService';
import ProductCategoryRepository, { CategoryFilters } from '../repositories/ProductCategoryRepository';
import { IPaginatedResponse } from '../interfaces/IProduct';

export interface CreateCategoryDTO {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: string;
  sort_order?: number;
  status?: 'active' | 'inactive';
  meta_data?: Record<string, any>;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {}

interface CategoryData extends ProductCategory {
  children?: CategoryData[];
}

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
  constructor() {
    super(ProductCategoryRepository as ICategoryRepository);
  }

  /**
   * Get category tree structure
   */
  async getTree(): Promise<CategoryData[]> {
    return this.repository.getTree();
  }

  // Validation overrides

  protected validateCreate(data: CreateCategoryDTO): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Category name is required');
    }
    if (!data.slug || data.slug.trim().length === 0) {
      throw new Error('Category slug is required');
    }
  }

  protected validateUpdate(data: UpdateCategoryDTO): void {
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new Error('Category name cannot be empty');
    }
    if (data.slug !== undefined && data.slug.trim().length === 0) {
      throw new Error('Category slug cannot be empty');
    }
  }

  // Transform overrides

  protected transformCreateData(data: CreateCategoryDTO): any {
    return {
      ...data,
      slug: data.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    };
  }

  protected transformUpdateData(data: UpdateCategoryDTO): any {
    const result = { ...data };
    if (data.slug !== undefined) {
      result.slug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    }
    return result;
  }
}

export default new ProductCategoryService();
