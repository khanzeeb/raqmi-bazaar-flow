import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ProductCategory, CategoryStatus } from '../../../entities/product-category.entity';
import { CreateCategoryDto, UpdateCategoryDto, CategoryFiltersDto } from './dto';
import { PaginatedResult } from '../../product/product.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<ProductCategory> {
    const existing = await this.categoryRepository.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException(`Category with slug '${dto.slug}' already exists`);
    }

    const category = this.categoryRepository.create(dto);
    return this.categoryRepository.save(category);
  }

  async findAll(filters: CategoryFiltersDto): Promise<PaginatedResult<ProductCategory>> {
    const { search, parentId, status, page = 1, limit = 50, sortBy = 'sortOrder', sortOrder = 'asc' } = filters;

    const qb = this.categoryRepository.createQueryBuilder('category');

    if (search?.trim()) {
      qb.andWhere('(category.name ILIKE :search OR category.description ILIKE :search)', {
        search: `%${search.trim()}%`,
      });
    }

    if (parentId !== undefined) {
      if (parentId === null || parentId === 'null') {
        qb.andWhere('category.parent_id IS NULL');
      } else {
        qb.andWhere('category.parent_id = :parentId', { parentId });
      }
    }

    if (status) {
      qb.andWhere('category.status = :status', { status });
    }

    const sortColumn = sortBy === 'sortOrder' ? 'sort_order' : sortBy === 'createdAt' ? 'created_at' : sortBy;
    qb.orderBy(`category.${sortColumn}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<ProductCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }
    return category;
  }

  async getTree(): Promise<ProductCategory[]> {
    const roots = await this.categoryRepository.find({
      where: { parentId: IsNull() },
      relations: ['children'],
      order: { sortOrder: 'ASC' },
    });

    // Load nested children recursively
    for (const root of roots) {
      await this.loadChildren(root);
    }

    return roots;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<ProductCategory> {
    const category = await this.findById(id);

    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.categoryRepository.findOne({ where: { slug: dto.slug } });
      if (existing) {
        throw new ConflictException(`Category with slug '${dto.slug}' already exists`);
      }
    }

    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async delete(id: string): Promise<boolean> {
    const category = await this.findById(id);
    await this.categoryRepository.remove(category);
    return true;
  }

  private async loadChildren(category: ProductCategory): Promise<void> {
    if (category.children?.length) {
      for (const child of category.children) {
        child.children = await this.categoryRepository.find({
          where: { parentId: child.id },
          order: { sortOrder: 'ASC' },
        });
        await this.loadChildren(child);
      }
    }
  }
}
