// Product Category Repository - Data access for categories
import { Prisma, CategoryStatus, ProductCategory } from '@prisma/client';
import { BaseRepository, BaseFilters } from '../common/BaseRepository';

export interface CategoryFilters extends BaseFilters {
  parent_id?: string | null;
  status?: CategoryStatus;
}

interface CategoryData extends ProductCategory {
  children?: CategoryData[];
}

class ProductCategoryRepository extends BaseRepository<CategoryData, CategoryFilters> {
  protected modelName = 'ProductCategory';

  protected getModel() {
    return this.prisma.productCategory;
  }

  protected getDefaultIncludes() {
    return {
      children: {
        orderBy: [
          { sort_order: 'asc' as const },
          { name: 'asc' as const }
        ]
      }
    };
  }

  protected getSearchableFields(): string[] {
    return ['name', 'description'];
  }

  protected getDefaultSortField(): string {
    return 'sort_order';
  }

  protected mapItem(item: any): CategoryData {
    return item as CategoryData;
  }

  protected buildWhereClause(filters: CategoryFilters): Prisma.ProductCategoryWhereInput {
    const where: Prisma.ProductCategoryWhereInput = {};

    // Search filter
    const searchFilter = this.applySearchFilter(filters.search);
    if (searchFilter) {
      where.OR = searchFilter.OR;
    }

    // Parent ID filter
    if (filters.parent_id !== undefined) {
      if (filters.parent_id === '' || filters.parent_id === null) {
        where.parent_id = null;
      } else {
        where.parent_id = filters.parent_id;
      }
    }

    // Status filter
    if (filters.status) {
      where.status = filters.status;
    }

    return where;
  }

  protected buildOrderBy(filters: CategoryFilters): any {
    return [
      { sort_order: 'asc' },
      { name: 'asc' }
    ];
  }

  /**
   * Delete category with children handling (transaction)
   */
  async delete(id: string): Promise<boolean> {
    return this.withTransaction(async (tx) => {
      // Update children to remove parent reference
      await tx.productCategory.updateMany({
        where: { parent_id: id },
        data: { parent_id: null }
      });

      // Delete the category
      await tx.productCategory.delete({
        where: { id }
      });

      return true;
    });
  }

  /**
   * Get category tree structure
   */
  async getTree(): Promise<CategoryData[]> {
    const categories = await this.getModel().findMany({
      where: { status: 'active' },
      orderBy: [{ sort_order: 'asc' }, { name: 'asc' }]
    });

    // Build tree structure
    const categoryMap = new Map<string, CategoryData>();
    const tree: CategoryData[] = [];

    categories.forEach((category: CategoryData) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    categories.forEach((category: CategoryData) => {
      const categoryWithChildren = categoryMap.get(category.id)!;
      if (category.parent_id && categoryMap.has(category.parent_id)) {
        categoryMap.get(category.parent_id)!.children!.push(categoryWithChildren);
      } else {
        tree.push(categoryWithChildren);
      }
    });

    return tree;
  }
}

export default new ProductCategoryRepository();
