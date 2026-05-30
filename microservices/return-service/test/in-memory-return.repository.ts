import { randomUUID } from 'crypto';

/**
 * In-memory stand-in for ReturnRepository used in e2e tests.
 * Mirrors the public API of the real repository so the service layer
 * can run unchanged against it.
 */
export class InMemoryReturnRepository {
  public returns = new Map<string, any>();
  public items = new Map<string, any[]>();
  private seq = 0;

  async findById(id: string) {
    return this.returns.get(id) ?? null;
  }

  async findByReturnNumber(rn: string) {
    return [...this.returns.values()].find((r) => r.return_number === rn) ?? null;
  }

  async findBySaleId(saleId: string) {
    return [...this.returns.values()].filter((r) => r.sale_id === saleId);
  }

  async findByCustomerId(customerId: string) {
    return [...this.returns.values()].filter((r) => r.customer_id === customerId);
  }

  async findAll(filters: any = {}) {
    let data = [...this.returns.values()];
    if (filters.status) data = data.filter((r) => r.status === filters.status);
    if (filters.returnType) data = data.filter((r) => r.return_type === filters.returnType);
    if (filters.customerId) data = data.filter((r) => r.customer_id === filters.customerId);
    if (filters.saleId) data = data.filter((r) => r.sale_id === filters.saleId);
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const total = data.length;
    return {
      data: data.slice((page - 1) * limit, page * limit),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: Record<string, any>) {
    const row = { id: randomUUID(), created_at: new Date(), updated_at: new Date(), ...data };
    this.returns.set(row.id, row);
    return row;
  }

  async update(id: string, data: Record<string, any>) {
    const existing = this.returns.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updated_at: new Date() };
    this.returns.set(id, updated);
    return updated;
  }

  async delete(id: string) {
    return this.returns.delete(id);
  }

  async generateReturnNumber() {
    this.seq += 1;
    const now = new Date();
    const prefix = `RET-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    return `${prefix}-${String(this.seq).padStart(4, '0')}`;
  }

  async getStats(_from?: string, _to?: string) {
    const data = [...this.returns.values()];
    const count = (pred: (r: any) => boolean) => data.filter(pred).length;
    return {
      totalReturns: data.length,
      totalAmount: data.reduce((s, r) => s + Number(r.total_amount), 0),
      totalRefunded: data.reduce((s, r) => s + Number(r.refund_amount), 0),
      pendingCount: count((r) => r.status === 'pending'),
      approvedCount: count((r) => r.status === 'approved'),
      rejectedCount: count((r) => r.status === 'rejected'),
      completedCount: count((r) => r.status === 'completed'),
      fullReturnsCount: count((r) => r.return_type === 'full'),
      partialReturnsCount: count((r) => r.return_type === 'partial'),
    };
  }

  async findItemsByReturnId(returnId: string) {
    return this.items.get(returnId) ?? [];
  }

  async createItems(items: Record<string, any>[]) {
    if (!items.length) return [];
    const stored = items.map((i) => ({ id: randomUUID(), created_at: new Date(), ...i }));
    const returnId = stored[0].return_id;
    this.items.set(returnId, [...(this.items.get(returnId) ?? []), ...stored]);
    return stored;
  }

  async deleteItemsByReturnId(returnId: string) {
    const count = (this.items.get(returnId) ?? []).length;
    this.items.delete(returnId);
    return count;
  }

  async getSaleItemReturnedQty(saleItemId: string) {
    let total = 0;
    for (const list of this.items.values()) {
      for (const it of list) {
        if (it.sale_item_id === saleItemId) total += Number(it.quantity_returned);
      }
    }
    return total;
  }

  async withinTransaction<R>(cb: (trx: any) => Promise<R>): Promise<R> {
    // No real transaction — execute callback with a noop trx token.
    return cb({} as any);
  }
}
