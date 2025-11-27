import ProductVariantRepository, { VariantFilters } from '../repositories/ProductVariantRepository';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreateVariantDTO {
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost: number;
  stock?: number;
  min_stock?: number;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  attributes?: Record<string, any>;
  image?: string;
  images?: string[];
  status?: 'active' | 'inactive';
  sort_order?: number;
}

export interface UpdateVariantDTO extends Partial<CreateVariantDTO> {}

class ProductVariantService {
  async getById(id: string) {
    const variant = await ProductVariantRepository.findById(id);
    return variant ? this.transformVariant(variant) : null;
  }

  async getAll(filters?: VariantFilters) {
    const result = await ProductVariantRepository.findAll(filters || {});
    return {
      ...result,
      data: result.data.map(variant => this.transformVariant(variant))
    };
  }

  async getByProductId(productId: string) {
    const variants = await ProductVariantRepository.findByProductId(productId);
    return variants.map(variant => this.transformVariant(variant));
  }

  async create(data: CreateVariantDTO & { product_id: string }) {
    // Validation
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Variant name is required');
    }
    if (data.price <= 0) {
      throw new Error('Variant price must be greater than 0');
    }
    if (data.cost < 0) {
      throw new Error('Variant cost cannot be negative');
    }

    const variant = await ProductVariantRepository.create({
      ...data,
      price: new Decimal(data.price),
      cost: new Decimal(data.cost),
      weight: data.weight ? new Decimal(data.weight) : null,
      images: data.images || [],
      dimensions: data.dimensions || null,
      attributes: data.attributes || {},
      product: { connect: { id: data.product_id } }
    } as any);

    return this.transformVariant(variant);
  }

  async createForProduct(productId: string, data: CreateVariantDTO) {
    // Validation
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Variant name is required');
    }
    if (data.price <= 0) {
      throw new Error('Variant price must be greater than 0');
    }
    if (data.cost < 0) {
      throw new Error('Variant cost cannot be negative');
    }

    const variant = await ProductVariantRepository.createForProduct(productId, {
      ...data,
      price: new Decimal(data.price),
      cost: new Decimal(data.cost),
      weight: data.weight ? new Decimal(data.weight) : null,
      images: data.images || [],
      dimensions: data.dimensions || null,
      attributes: data.attributes || {}
    });

    return this.transformVariant(variant);
  }

  async update(id: string, data: UpdateVariantDTO) {
    const existing = await ProductVariantRepository.findById(id);
    if (!existing) {
      return null;
    }

    // Validation
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new Error('Variant name cannot be empty');
    }
    if (data.price !== undefined && data.price <= 0) {
      throw new Error('Variant price must be greater than 0');
    }
    if (data.cost !== undefined && data.cost < 0) {
      throw new Error('Variant cost cannot be negative');
    }

    const updateData: any = { ...data };
    if (data.price !== undefined) updateData.price = new Decimal(data.price);
    if (data.cost !== undefined) updateData.cost = new Decimal(data.cost);
    if (data.weight !== undefined) updateData.weight = data.weight ? new Decimal(data.weight) : null;

    const variant = await ProductVariantRepository.update(id, updateData);
    return variant ? this.transformVariant(variant) : null;
  }

  async delete(id: string) {
    const existing = await ProductVariantRepository.findById(id);
    if (!existing) {
      return false;
    }
    return ProductVariantRepository.delete(id);
  }

  private transformVariant(variant: any) {
    return {
      ...variant,
      price: variant.price ? Number(variant.price) : 0,
      cost: variant.cost ? Number(variant.cost) : 0,
      weight: variant.weight ? Number(variant.weight) : null
    };
  }
}

export default new ProductVariantService();
