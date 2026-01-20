// Category Transformer - Handles all Category data transformations
// SOLID: Single Responsibility - Only transforms category data

import { ProductCategory } from '@prisma/client';
import { BaseTransformer } from './BaseTransformer';

export interface CategoryCreateInput {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: string;
  sort_order?: number;
  status?: 'active' | 'inactive';
  meta_data?: Record<string, any>;
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parent_id: string | null;
  sort_order: number;
  status: string;
  meta_data: Record<string, any>;
  children?: CategoryData[];
  created_at: Date;
  updated_at: Date;
}

export class CategoryTransformer extends BaseTransformer<CategoryCreateInput, CategoryData> {
  /**
   * Transform create DTO to Prisma format
   */
  forCreate(data: CategoryCreateInput): any {
    return {
      name: data.name,
      slug: this.normalizeSlug(data.slug) || '',
      description: data.description,
      image: data.image,
      parent_id: data.parent_id,
      sort_order: data.sort_order ?? 0,
      status: data.status ?? 'active',
      meta_data: this.ensureObject(data.meta_data),
    };
  }

  /**
   * Transform update DTO to Prisma format (only provided fields)
   */
  forUpdate(data: Partial<CategoryCreateInput>): any {
    const result: any = {};

    if (data.name !== undefined) result.name = data.name;
    if (data.slug !== undefined) result.slug = this.normalizeSlug(data.slug);
    if (data.description !== undefined) result.description = data.description;
    if (data.image !== undefined) result.image = data.image;
    if (data.parent_id !== undefined) result.parent_id = data.parent_id;
    if (data.sort_order !== undefined) result.sort_order = data.sort_order;
    if (data.status !== undefined) result.status = data.status;
    if (data.meta_data !== undefined) result.meta_data = data.meta_data;

    return result;
  }

  /**
   * Transform database entity to API response format
   */
  toResponse(entity: ProductCategory & { children?: ProductCategory[] }): CategoryData {
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      description: entity.description,
      image: entity.image,
      parent_id: entity.parent_id,
      sort_order: entity.sort_order ?? 0,
      status: entity.status,
      meta_data: this.ensureObject(entity.meta_data as Record<string, any>),
      children: entity.children?.map(child => this.toResponse(child)),
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    };
  }

  /**
   * Transform list of categories
   */
  toResponseList(entities: ProductCategory[]): CategoryData[] {
    return entities.map(entity => this.toResponse(entity));
  }
}

// Singleton instance
export const categoryTransformer = new CategoryTransformer();
