import ProductCategoryRepository, { CategoryFilters } from '../repositories/ProductCategoryRepository';

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

class ProductCategoryService {
  async getById(id: string) {
    return ProductCategoryRepository.findById(id);
  }

  async getAll(filters?: CategoryFilters) {
    return ProductCategoryRepository.findAll(filters || {});
  }

  async create(data: CreateCategoryDTO) {
    // Validation
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Category name is required');
    }
    if (!data.slug || data.slug.trim().length === 0) {
      throw new Error('Category slug is required');
    }

    // Ensure slug is URL-friendly
    const slug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    return ProductCategoryRepository.create({
      ...data,
      slug
    });
  }

  async update(id: string, data: UpdateCategoryDTO) {
    const existing = await ProductCategoryRepository.findById(id);
    if (!existing) {
      return null;
    }

    // Validation
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new Error('Category name cannot be empty');
    }

    const updateData = { ...data };
    if (data.slug !== undefined) {
      if (data.slug.trim().length === 0) {
        throw new Error('Category slug cannot be empty');
      }
      updateData.slug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    }

    return ProductCategoryRepository.update(id, updateData);
  }

  async delete(id: string) {
    const existing = await ProductCategoryRepository.findById(id);
    if (!existing) {
      return false;
    }
    return ProductCategoryRepository.delete(id);
  }

  async getTree() {
    return ProductCategoryRepository.getTree();
  }
}

export default new ProductCategoryService();
