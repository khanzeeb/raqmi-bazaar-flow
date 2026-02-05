import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product, ProductStatus } from '../../../entities/product.entity';
import { ProductVariant } from '../../../entities/product-variant.entity';
import { StockMovement, MovementType } from '../../../entities/stock-movement.entity';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateStockDto,
  ProductFiltersDto,
} from '../dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductStats {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(StockMovement)
    private readonly stockMovementRepository: Repository<StockMovement>,
    private readonly dataSource: DataSource,
  ) {}

  // ============= Product CRUD =============

  async create(createDto: CreateProductDto): Promise<Product> {
    // Check duplicate SKU
    const existing = await this.productRepository.findOne({ where: { sku: createDto.sku } });
    if (existing) {
      throw new ConflictException(`Product with SKU '${createDto.sku}' already exists`);
    }

    const { variants: variantDtos, ...productData } = createDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = this.productRepository.create(productData);
      const savedProduct = await queryRunner.manager.save(product);

      if (variantDtos?.length) {
        const variants = variantDtos.map((v, i) =>
          this.variantRepository.create({
            ...v,
            productId: savedProduct.id,
            sortOrder: v.sortOrder ?? i,
          }),
        );
        await queryRunner.manager.save(variants);
      }

      await queryRunner.commitTransaction();
      return this.findById(savedProduct.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(filters: ProductFiltersDto): Promise<PaginatedResult<Product>> {
    const {
      search,
      categoryId,
      category,
      status,
      stockStatus,
      supplier,
      priceMin,
      priceMax,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variant')
      .leftJoinAndSelect('product.category', 'category');

    // Search
    if (search?.trim()) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.sku ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search.trim()}%` },
      );
    }

    // Category filter
    if (categoryId) {
      qb.andWhere('product.category_id = :categoryId', { categoryId });
    } else if (category) {
      qb.andWhere('category.name = :category', { category });
    }

    // Status filter
    if (status) {
      qb.andWhere('product.status = :status', { status });
    }

    // Stock status filter
    if (stockStatus) {
      switch (stockStatus) {
        case 'out-of-stock':
          qb.andWhere('product.stock <= 0');
          break;
        case 'low-stock':
          qb.andWhere('product.stock > 0 AND product.stock <= product.min_stock');
          break;
        case 'in-stock':
          qb.andWhere('product.stock > 0');
          break;
      }
    }

    // Price range
    if (priceMin !== undefined) {
      qb.andWhere('product.price >= :priceMin', { priceMin });
    }
    if (priceMax !== undefined) {
      qb.andWhere('product.price <= :priceMax', { priceMax });
    }

    // Supplier
    if (supplier) {
      qb.andWhere('product.supplier = :supplier', { supplier });
    }

    // Sorting
    const sortColumn = this.mapToSnakeCase(sortBy);
    qb.orderBy(`product.${sortColumn}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');
    qb.addOrderBy('variant.sort_order', 'ASC');

    // Pagination
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['variants', 'category'],
      order: { variants: { sortOrder: 'ASC' } },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }
    return product;
  }

  async update(id: string, updateDto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);
    const { variants: variantDtos, ...productData } = updateDto;

    // Check SKU uniqueness if changing
    if (productData.sku && productData.sku !== product.sku) {
      const existing = await this.productRepository.findOne({ where: { sku: productData.sku } });
      if (existing) {
        throw new ConflictException(`Product with SKU '${productData.sku}' already exists`);
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      Object.assign(product, productData);
      await queryRunner.manager.save(product);

      if (variantDtos !== undefined) {
        // Replace variants
        await queryRunner.manager.delete(ProductVariant, { productId: id });

        if (variantDtos.length > 0) {
          const variants = variantDtos.map((v, i) =>
            this.variantRepository.create({
              ...v,
              productId: id,
              sortOrder: v.sortOrder ?? i,
            }),
          );
          await queryRunner.manager.save(variants);
        }
      }

      await queryRunner.commitTransaction();
      return this.findById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string): Promise<boolean> {
    const product = await this.findById(id);
    await this.productRepository.remove(product);
    return true;
  }

  // ============= Stock Operations =============

  async updateStock(id: string, dto: UpdateStockDto): Promise<Product> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await this.findById(id);

      await queryRunner.manager.update(Product, id, { stock: dto.stock });

      // Record stock movement
      const movement = this.stockMovementRepository.create({
        productId: id,
        type: MovementType.ADJUSTMENT,
        quantity: dto.stock,
        reason: dto.reason || '',
      });
      await queryRunner.manager.save(movement);

      await queryRunner.commitTransaction();
      return this.findById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getLowStockProducts(limit = 10): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variant')
      .where('product.stock > 0 AND product.stock <= product.min_stock')
      .orderBy('product.stock', 'ASC')
      .limit(limit)
      .getMany();
  }

  // ============= Statistics =============

  async getStats(): Promise<ProductStats> {
    const totalProducts = await this.productRepository.count();
    const inStock = await this.productRepository
      .createQueryBuilder('p')
      .where('p.stock > 0')
      .getCount();
    const lowStock = await this.productRepository
      .createQueryBuilder('p')
      .where('p.stock > 0 AND p.stock <= p.min_stock')
      .getCount();
    const outOfStock = await this.productRepository
      .createQueryBuilder('p')
      .where('p.stock <= 0')
      .getCount();

    return { totalProducts, inStock, lowStock, outOfStock };
  }

  // ============= Lookups =============

  async getCategories(): Promise<string[]> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .select('DISTINCT category.name', 'name')
      .where('category.name IS NOT NULL')
      .orderBy('category.name', 'ASC')
      .getRawMany();
    return result.map((r) => r.name).filter(Boolean);
  }

  async getSuppliers(): Promise<string[]> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.supplier', 'supplier')
      .where('product.supplier IS NOT NULL')
      .orderBy('product.supplier', 'ASC')
      .getRawMany();
    return result.map((r) => r.supplier).filter(Boolean);
  }

  // ============= Variant Operations =============

  async getVariantsByProductId(productId: string): Promise<ProductVariant[]> {
    await this.findById(productId); // Verify product exists
    return this.variantRepository.find({
      where: { productId },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async getVariantById(id: string): Promise<ProductVariant> {
    const variant = await this.variantRepository.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!variant) {
      throw new NotFoundException(`Variant with ID '${id}' not found`);
    }
    return variant;
  }

  async createVariant(productId: string, dto: any): Promise<ProductVariant> {
    await this.findById(productId); // Verify product exists
    const variant = this.variantRepository.create({ ...dto, productId });
    return this.variantRepository.save(variant);
  }

  async updateVariant(id: string, dto: any): Promise<ProductVariant> {
    const variant = await this.getVariantById(id);
    Object.assign(variant, dto);
    return this.variantRepository.save(variant);
  }

  async deleteVariant(id: string): Promise<boolean> {
    const variant = await this.getVariantById(id);
    await this.variantRepository.remove(variant);
    return true;
  }

  // ============= Helpers =============

  private mapToSnakeCase(camelCase: string): string {
    const mapping: Record<string, string> = {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      minStock: 'min_stock',
      maxStock: 'max_stock',
      shortDescription: 'short_description',
      categoryId: 'category_id',
    };
    return mapping[camelCase] || camelCase;
  }
}
