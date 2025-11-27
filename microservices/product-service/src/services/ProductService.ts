import ProductRepository, { ProductFilters } from '../repositories/ProductRepository';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreateProductDTO {
  name: string;
  sku: string;
  category?: string;
  category_id?: string;
  price: number;
  cost: number;
  stock?: number;
  min_stock?: number;
  max_stock?: number;
  image?: string;
  images?: string[];
  description?: string;
  short_description?: string;
  status?: 'active' | 'inactive' | 'discontinued';
  supplier?: string;
  barcode?: string;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  tags?: string[];
  variants?: any[];
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}

class ProductService {
  async getById(id: string) {
    const product = await ProductRepository.findById(id);
    return product ? this.transformProduct(product) : null;
  }

  async getAll(filters?: ProductFilters) {
    const result = await ProductRepository.findAll(filters || {});
    return {
      ...result,
      data: result.data.map(product => this.transformProduct(product))
    };
  }

  async create(data: CreateProductDTO) {
    // Validation
    if (data.price <= 0) {
      throw new Error('Price must be greater than 0');
    }
    if (data.cost < 0) {
      throw new Error('Cost cannot be negative');
    }

    const { variants, ...productData } = data;

    const product = await ProductRepository.createWithVariants(
      {
        ...productData,
        price: new Decimal(data.price),
        cost: new Decimal(data.cost),
        weight: data.weight ? new Decimal(data.weight) : null,
        images: data.images || [],
        dimensions: data.dimensions || null,
        tags: data.tags || []
      },
      variants?.map(v => ({
        ...v,
        price: new Decimal(v.price),
        cost: new Decimal(v.cost),
        weight: v.weight ? new Decimal(v.weight) : null,
        images: v.images || [],
        dimensions: v.dimensions || null,
        attributes: v.attributes || {}
      }))
    );

    return this.transformProduct(product);
  }

  async update(id: string, data: UpdateProductDTO) {
    const existing = await ProductRepository.findById(id);
    if (!existing) {
      return null;
    }

    // Validation
    if (data.price !== undefined && data.price <= 0) {
      throw new Error('Price must be greater than 0');
    }
    if (data.cost !== undefined && data.cost < 0) {
      throw new Error('Cost cannot be negative');
    }

    const { variants, ...productData } = data;

    const updateData: any = { ...productData };
    if (data.price !== undefined) updateData.price = new Decimal(data.price);
    if (data.cost !== undefined) updateData.cost = new Decimal(data.cost);
    if (data.weight !== undefined) updateData.weight = data.weight ? new Decimal(data.weight) : null;

    const product = await ProductRepository.updateWithVariants(
      id,
      updateData,
      variants?.map(v => ({
        ...v,
        price: new Decimal(v.price),
        cost: new Decimal(v.cost),
        weight: v.weight ? new Decimal(v.weight) : null,
        images: v.images || [],
        dimensions: v.dimensions || null,
        attributes: v.attributes || {}
      }))
    );

    return product ? this.transformProduct(product) : null;
  }

  async delete(id: string) {
    const existing = await ProductRepository.findById(id);
    if (!existing) {
      return false;
    }
    return ProductRepository.delete(id);
  }

  async updateStock(id: string, newStock: number, reason = '') {
    if (newStock < 0) {
      throw new Error('Stock cannot be negative');
    }

    const product = await ProductRepository.updateStock(id, newStock, reason);
    return product ? this.transformProduct(product) : null;
  }

  async getLowStockProducts(limit = 10) {
    const result = await ProductRepository.findAll({
      stockStatus: 'low-stock',
      limit
    });
    return result.data.map(product => this.transformProduct(product));
  }

  async getCategories() {
    return ProductRepository.getCategories();
  }

  async getSuppliers() {
    return ProductRepository.getSuppliers();
  }

  async getStats() {
    const [total, inStock, lowStock, outOfStock] = await Promise.all([
      ProductRepository.count({}),
      ProductRepository.count({ stockStatus: 'in-stock' }),
      ProductRepository.count({ stockStatus: 'low-stock' }),
      ProductRepository.count({ stockStatus: 'out-of-stock' })
    ]);

    return {
      totalProducts: total,
      inStock,
      lowStock,
      outOfStock
    };
  }

  private transformProduct(product: any) {
    return {
      ...product,
      price: product.price ? Number(product.price) : 0,
      cost: product.cost ? Number(product.cost) : 0,
      weight: product.weight ? Number(product.weight) : null,
      category_info: product.category_rel ? {
        id: product.category_rel.id,
        name: product.category_rel.name,
        slug: product.category_rel.slug
      } : undefined,
      variants: product.variants?.map((v: any) => ({
        ...v,
        price: v.price ? Number(v.price) : 0,
        cost: v.cost ? Number(v.cost) : 0,
        weight: v.weight ? Number(v.weight) : null
      }))
    };
  }
}

export default new ProductService();
