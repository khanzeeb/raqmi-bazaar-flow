import { ProductCategoryData } from '../models/ProductCategory';

export class ProductCategoryMapper {
  toProductCategoryData(dbData: any): ProductCategoryData {
    return {
      id: dbData.id,
      name: dbData.name,
      slug: dbData.slug,
      description: dbData.description,
      image: dbData.image,
      parent_id: dbData.parent_id,
      sort_order: dbData.sort_order || 0,
      status: dbData.status || 'active',
      meta_data: dbData.meta_data ? JSON.parse(dbData.meta_data) : {},
      children: dbData.children || [],
      created_at: dbData.created_at,
      updated_at: dbData.updated_at
    };
  }

  toDatabase(categoryData: Partial<ProductCategoryData>): any {
    const dbData: any = {};

    if (categoryData.name !== undefined) dbData.name = categoryData.name;
    if (categoryData.slug !== undefined) dbData.slug = categoryData.slug;
    if (categoryData.description !== undefined) dbData.description = categoryData.description;
    if (categoryData.image !== undefined) dbData.image = categoryData.image;
    if (categoryData.parent_id !== undefined) dbData.parent_id = categoryData.parent_id;
    if (categoryData.sort_order !== undefined) dbData.sort_order = categoryData.sort_order;
    if (categoryData.status !== undefined) dbData.status = categoryData.status;
    if (categoryData.meta_data !== undefined) dbData.meta_data = JSON.stringify(categoryData.meta_data);

    return dbData;
  }

  toProductCategoryDataList(dbDataList: any[]): ProductCategoryData[] {
    return dbDataList.map(dbData => this.toProductCategoryData(dbData));
  }
}

export default new ProductCategoryMapper();
