import { BaseRepository } from '../common/BaseRepository';
import { IReturnRepository } from '../interfaces/IRepository';

export interface Return {
  id: string;
  return_number: string;
  sale_id: string;
  customer_id: string;
  return_date: string;
  return_type: 'full' | 'partial';
  reason: string;
  notes?: string;
  total_amount: number;
  refund_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  refund_status: 'pending' | 'processed' | 'cancelled';
  processed_by?: string;
  processed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ReturnFilters {
  customer_id?: string;
  sale_id?: string;
  status?: string;
  return_type?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ReturnRepository extends BaseRepository<Return, ReturnFilters> implements IReturnRepository {
  protected tableName = 'returns';

  protected buildFindAllQuery(filters: ReturnFilters) {
    let query = this.db(this.tableName)
      .leftJoin('customers', 'returns.customer_id', 'customers.id')
      .leftJoin('sales', 'returns.sale_id', 'sales.id')
      .select(
        'returns.*',
        'customers.name as customer_name',
        'customers.email as customer_email',
        'sales.sale_number'
      );

    if (filters.customer_id) {
      query = query.where('returns.customer_id', filters.customer_id);
    }

    if (filters.sale_id) {
      query = query.where('returns.sale_id', filters.sale_id);
    }

    if (filters.status) {
      query = query.where('returns.status', filters.status);
    }

    if (filters.return_type) {
      query = query.where('returns.return_type', filters.return_type);
    }

    if (filters.date_from) {
      query = query.where('returns.return_date', '>=', filters.date_from);
    }

    if (filters.date_to) {
      query = query.where('returns.return_date', '<=', filters.date_to);
    }

    if (filters.search) {
      this.applySearchFilter(query, filters.search, [
        'returns.return_number',
        'customers.name',
        'customers.email',
        'sales.sale_number'
      ]);
    }

    this.applySorting(query, filters.sortBy, filters.sortOrder);

    return query;
  }

  protected buildCountQuery(filters: ReturnFilters) {
    let query = this.db(this.tableName)
      .leftJoin('customers', 'returns.customer_id', 'customers.id')
      .leftJoin('sales', 'returns.sale_id', 'sales.id')
      .count('returns.id as count');

    if (filters.customer_id) {
      query = query.where('returns.customer_id', filters.customer_id);
    }

    if (filters.sale_id) {
      query = query.where('returns.sale_id', filters.sale_id);
    }

    if (filters.status) {
      query = query.where('returns.status', filters.status);
    }

    if (filters.return_type) {
      query = query.where('returns.return_type', filters.return_type);
    }

    if (filters.date_from) {
      query = query.where('returns.return_date', '>=', filters.date_from);
    }

    if (filters.date_to) {
      query = query.where('returns.return_date', '<=', filters.date_to);
    }

    if (filters.search) {
      this.applySearchFilter(query, filters.search, [
        'returns.return_number',
        'customers.name',
        'customers.email',
        'sales.sale_number'
      ]);
    }

    return query;
  }

  async findBySaleId(saleId: string): Promise<Return[]> {
    return await this.db(this.tableName)
      .leftJoin('customers', 'returns.customer_id', 'customers.id')
      .leftJoin('sales', 'returns.sale_id', 'sales.id')
      .select(
        'returns.*',
        'customers.name as customer_name',
        'customers.email as customer_email',
        'sales.sale_number'
      )
      .where('returns.sale_id', saleId)
      .orderBy('returns.created_at', 'desc');
  }

  async getSaleStateBeforeReturn(saleId: string, returnId?: string): Promise<any> {
    let query = this.db('sale_items')
      .leftJoin('products', 'sale_items.product_id', 'products.id')
      .select(
        'sale_items.*',
        'products.name as current_product_name',
        'products.sku as current_product_sku'
      )
      .where('sale_items.sale_id', saleId);

    const saleItems = await query;

    // Get returns up to the specified return (or all if returnId is null)
    let returnsQuery = this.db('returns')
      .where('sale_id', saleId);

    if (returnId) {
      const targetReturn = await this.findById(returnId);
      if (targetReturn) {
        returnsQuery = returnsQuery.where('created_at', '<', targetReturn.created_at);
      }
    }

    const returns = await returnsQuery.orderBy('created_at');

    // Calculate state before this return
    const itemsState = await Promise.all(saleItems.map(async (saleItem: any) => {
      const returnItemsQuery = this.db('return_items')
        .where('sale_item_id', saleItem.id);

      if (returnId) {
        const targetReturn = await this.findById(returnId);
        if (targetReturn) {
          returnItemsQuery.where('created_at', '<', targetReturn.created_at);
        }
      }

      const returnItems = await returnItemsQuery;
      const totalReturned = returnItems.reduce((sum: number, item: any) => sum + item.quantity_returned, 0);

      return {
        ...saleItem,
        quantity_returned: totalReturned,
        quantity_remaining: saleItem.quantity - totalReturned
      };
    }));

    const sale = await this.db('sales')
      .leftJoin('customers', 'sales.customer_id', 'customers.id')
      .select(
        'sales.*',
        'customers.name as customer_name',
        'customers.email as customer_email'
      )
      .where('sales.id', saleId)
      .first();

    return {
      ...sale,
      items: itemsState,
      returns: returns
    };
  }

  async getSaleStateAfterReturn(saleId: string, returnId: string): Promise<any> {
    const saleStateBefore = await this.getSaleStateBeforeReturn(saleId, returnId);
    
    // Get the target return with its items
    const targetReturn = await this.findById(returnId);
    const returnItems = await this.db('return_items')
      .where('return_id', returnId);

    // Apply the target return to calculate state after
    const itemsStateAfter = saleStateBefore.items.map((saleItem: any) => {
      const returnItem = returnItems.find((ri: any) => ri.sale_item_id === saleItem.id);
      const additionalReturned = returnItem ? returnItem.quantity_returned : 0;

      return {
        ...saleItem,
        quantity_returned: saleItem.quantity_returned + additionalReturned,
        quantity_remaining: saleItem.quantity_remaining - additionalReturned
      };
    });

    return {
      ...saleStateBefore,
      items: itemsStateAfter,
      returns: [...saleStateBefore.returns, targetReturn]
    };
  }

  async generateReturnNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `RET-${year}${month}`;

    const lastReturn = await this.db(this.tableName)
      .where('return_number', 'like', `${prefix}%`)
      .orderBy('return_number', 'desc')
      .first();

    let nextNumber = 1;
    if (lastReturn) {
      const lastNumber = parseInt(lastReturn.return_number.split('-').pop() || '0');
      nextNumber = lastNumber + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  async getReturnStats(filters?: ReturnFilters): Promise<any> {
    let query = this.db(this.tableName);

    if (filters?.customer_id) {
      query = query.where('customer_id', filters.customer_id);
    }

    if (filters?.date_from) {
      query = query.where('return_date', '>=', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.where('return_date', '<=', filters.date_to);
    }

    const stats = await query
      .select(
        this.db.raw('COUNT(*) as total_returns'),
        this.db.raw('SUM(total_amount) as total_return_value'),
        this.db.raw('SUM(refund_amount) as total_refunded'),
        this.db.raw('AVG(total_amount) as average_return_value'),
        this.db.raw("COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_returns"),
        this.db.raw("COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_returns"),
        this.db.raw("COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_returns")
      )
      .first();

    return stats;
  }
}