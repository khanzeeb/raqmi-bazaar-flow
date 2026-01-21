// Category Mapper Implementation - Single Responsibility: Category data transformation

import { ICategoryData } from '../data';
import { ICategoryMapper } from './ICategoryMapper';

export class CategoryMapper implements ICategoryMapper {
  /**
   * Map database entity to category data
   */
  toCategoryData(item: any): ICategoryData {
    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      image: item.image,
      parent_id: item.parent_id,
      sort_order: item.sort_order ?? 0,
      status: item.status,
      meta_data: item.meta_data ?? {},
      children: item.children?.map((c: any) => this.toCategoryData(c)),
      created_at: item.created_at,
      updated_at: item.updated_at
    };
  }

  /**
   * Map category data to database format for create
   */
  toDatabase(data: any): any {
    return {
      name: data.name,
      slug: this.normalizeSlug(data.slug),
      description: data.description,
      image: data.image,
      parent_id: data.parent_id || null,
      sort_order: data.sort_order ?? 0,
      status: data.status ?? 'active',
      meta_data: data.meta_data ?? {}
    };
  }

  /**
   * Map category data to database format for update
   */
  toDatabaseUpdate(data: any): any {
    const result: any = {};

    if (data.name !== undefined) result.name = data.name;
    if (data.slug !== undefined) result.slug = this.normalizeSlug(data.slug);
    if (data.description !== undefined) result.description = data.description;
    if (data.image !== undefined) result.image = data.image;
    if (data.parent_id !== undefined) result.parent_id = data.parent_id || null;
    if (data.sort_order !== undefined) result.sort_order = data.sort_order;
    if (data.status !== undefined) result.status = data.status;
    if (data.meta_data !== undefined) result.meta_data = data.meta_data;

    return result;
  }

  // Private helpers

  private normalizeSlug(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }
}
