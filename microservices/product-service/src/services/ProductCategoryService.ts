import { BaseService } from '../common/BaseService';
import { IProductCategoryService } from '../interfaces/IService';
import ProductCategoryRepository from '../models/ProductCategory';
import { ProductCategoryData, ProductCategoryFilters } from '../models/ProductCategory';

export interface CreateProductCategoryDTO {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: string;
  sort_order?: number;
  status?: 'active' | 'inactive';
  meta_data?: Record<string, any>;
}

export interface UpdateProductCategoryDTO extends Partial<CreateProductCategoryDTO> {}

class ProductCategoryService extends BaseService<ProductCategoryData, CreateProductCategoryDTO, UpdateProductCategoryDTO, ProductCategoryFilters> implements IProductCategoryService {
  constructor() {
    super(ProductCategoryRepository);
  }

  protected async validateCreateData(data: CreateProductCategoryDTO): Promise<any> {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Category name is required');
    }
    
    if (!data.slug || data.slug.trim().length === 0) {
      throw new Error('Category slug is required');
    }
    
    // Ensure slug is URL-friendly
    data.slug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    return data;
  }

  protected async validateUpdateData(data: UpdateProductCategoryDTO): Promise<any> {
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new Error('Category name cannot be empty');
    }
    
    if (data.slug !== undefined) {
      if (data.slug.trim().length === 0) {
        throw new Error('Category slug cannot be empty');
      }
      data.slug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    }
    
    return data;
  }

  async getTree(): Promise<ProductCategoryData[]> {
    return await ProductCategoryRepository.getTree();
  }
}

export default new ProductCategoryService();