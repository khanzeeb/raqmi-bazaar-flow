import { ProductData } from '../models/Product';

export class ProductMapper {
  toProductData(dbData: any): ProductData {
    return {
      id: dbData.id,
      name: dbData.name,
      sku: dbData.sku,
      category: dbData.category,
      category_id: dbData.category_id,
      price: parseFloat(dbData.price),
      cost: parseFloat(dbData.cost),
      stock: dbData.stock ? parseInt(dbData.stock) : 0,
      min_stock: dbData.min_stock ? parseInt(dbData.min_stock) : 0,
      max_stock: dbData.max_stock ? parseInt(dbData.max_stock) : null,
      image: dbData.image,
      images: dbData.images ? JSON.parse(dbData.images) : [],
      description: dbData.description,
      short_description: dbData.short_description,
      status: dbData.status || 'active',
      supplier: dbData.supplier,
      barcode: dbData.barcode,
      weight: dbData.weight ? parseFloat(dbData.weight) : null,
      dimensions: dbData.dimensions ? JSON.parse(dbData.dimensions) : null,
      tags: dbData.tags ? JSON.parse(dbData.tags) : [],
      variants: dbData.variants || [],
      category_info: dbData.category_name ? {
        id: dbData.category_id,
        name: dbData.category_name,
        slug: dbData.category_slug
      } : undefined,
      created_at: dbData.created_at,
      updated_at: dbData.updated_at
    };
  }

  toDatabase(productData: Partial<ProductData>): any {
    const dbData: any = {};

    if (productData.name !== undefined) dbData.name = productData.name;
    if (productData.sku !== undefined) dbData.sku = productData.sku;
    if (productData.category !== undefined) dbData.category = productData.category;
    if (productData.category_id !== undefined) dbData.category_id = productData.category_id;
    if (productData.price !== undefined) dbData.price = productData.price;
    if (productData.cost !== undefined) dbData.cost = productData.cost;
    if (productData.stock !== undefined) dbData.stock = productData.stock;
    if (productData.min_stock !== undefined) dbData.min_stock = productData.min_stock;
    if (productData.max_stock !== undefined) dbData.max_stock = productData.max_stock;
    if (productData.image !== undefined) dbData.image = productData.image;
    if (productData.images !== undefined) dbData.images = JSON.stringify(productData.images);
    if (productData.description !== undefined) dbData.description = productData.description;
    if (productData.short_description !== undefined) dbData.short_description = productData.short_description;
    if (productData.status !== undefined) dbData.status = productData.status;
    if (productData.supplier !== undefined) dbData.supplier = productData.supplier;
    if (productData.barcode !== undefined) dbData.barcode = productData.barcode;
    if (productData.weight !== undefined) dbData.weight = productData.weight;
    if (productData.dimensions !== undefined) dbData.dimensions = JSON.stringify(productData.dimensions);
    if (productData.tags !== undefined) dbData.tags = JSON.stringify(productData.tags);

    return dbData;
  }

  toProductDataList(dbDataList: any[]): ProductData[] {
    return dbDataList.map(dbData => this.toProductData(dbData));
  }
}

export default new ProductMapper();
