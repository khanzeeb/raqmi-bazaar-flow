import { ProductVariantData } from '../models/ProductVariant';

export class ProductVariantMapper {
  toProductVariantData(dbData: any): ProductVariantData {
    return {
      id: dbData.id,
      product_id: dbData.product_id,
      name: dbData.name,
      sku: dbData.sku,
      barcode: dbData.barcode,
      price: parseFloat(dbData.price),
      cost: parseFloat(dbData.cost),
      stock: dbData.stock ? parseInt(dbData.stock) : 0,
      min_stock: dbData.min_stock ? parseInt(dbData.min_stock) : 0,
      weight: dbData.weight ? parseFloat(dbData.weight) : null,
      dimensions: dbData.dimensions ? JSON.parse(dbData.dimensions) : null,
      attributes: dbData.attributes ? JSON.parse(dbData.attributes) : {},
      image: dbData.image,
      images: dbData.images ? JSON.parse(dbData.images) : [],
      status: dbData.status || 'active',
      sort_order: dbData.sort_order || 0,
      created_at: dbData.created_at,
      updated_at: dbData.updated_at
    };
  }

  toDatabase(variantData: Partial<ProductVariantData>): any {
    const dbData: any = {};

    if (variantData.product_id !== undefined) dbData.product_id = variantData.product_id;
    if (variantData.name !== undefined) dbData.name = variantData.name;
    if (variantData.sku !== undefined) dbData.sku = variantData.sku;
    if (variantData.barcode !== undefined) dbData.barcode = variantData.barcode;
    if (variantData.price !== undefined) dbData.price = variantData.price;
    if (variantData.cost !== undefined) dbData.cost = variantData.cost;
    if (variantData.stock !== undefined) dbData.stock = variantData.stock;
    if (variantData.min_stock !== undefined) dbData.min_stock = variantData.min_stock;
    if (variantData.weight !== undefined) dbData.weight = variantData.weight;
    if (variantData.dimensions !== undefined) dbData.dimensions = JSON.stringify(variantData.dimensions);
    if (variantData.attributes !== undefined) dbData.attributes = JSON.stringify(variantData.attributes);
    if (variantData.image !== undefined) dbData.image = variantData.image;
    if (variantData.images !== undefined) dbData.images = JSON.stringify(variantData.images);
    if (variantData.status !== undefined) dbData.status = variantData.status;
    if (variantData.sort_order !== undefined) dbData.sort_order = variantData.sort_order;

    return dbData;
  }

  toProductVariantDataList(dbDataList: any[]): ProductVariantData[] {
    return dbDataList.map(dbData => this.toProductVariantData(dbData));
  }
}

export default new ProductVariantMapper();
