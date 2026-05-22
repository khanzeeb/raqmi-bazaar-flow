import { ReturnRepository } from '../return.repository';

/**
 * Builds a chainable knex query-builder mock. Each terminal method
 * (`first`, `count`, `insert`, `update`, `delete`, `sum`, `select`)
 * resolves to a configurable value via `terminal.<name>` overrides.
 */
const makeQB = (terminal: Record<string, any> = {}) => {
  const qb: any = {};
  const chain = [
    'where', 'whereILike', 'orderBy', 'limit', 'offset', 'returning', 'clone',
  ];
  chain.forEach((m) => (qb[m] = jest.fn(() => qb)));
  qb.first = jest.fn().mockResolvedValue(terminal.first);
  qb.count = jest.fn(() => ({ first: jest.fn().mockResolvedValue(terminal.count ?? { c: '0' }) }));
  qb.sum = jest.fn(() => ({ first: jest.fn().mockResolvedValue(terminal.sum) }));
  qb.insert = jest.fn().mockReturnValue({
    returning: jest.fn().mockResolvedValue(terminal.insertReturning ?? []),
  });
  qb.update = jest.fn().mockReturnValue({
    returning: jest.fn().mockResolvedValue(terminal.updateReturning ?? []),
  });
  qb.delete = jest.fn().mockResolvedValue(terminal.delete ?? 0);
  qb.select = jest.fn().mockResolvedValue(terminal.select ?? []);
  // Make the builder thenable for `await query.orderBy(...).limit(...).offset(...)`
  qb.then = (resolve: any) => resolve(terminal.list ?? []);
  return qb;
};

const makeDb = (qb: any) => {
  const db: any = jest.fn(() => qb);
  db.fn = { now: () => 'NOW()' };
  db.raw = jest.fn((s: string) => s);
  db.transaction = jest.fn(async (cb: any) => cb('trx'));
  return db;
};

describe('ReturnRepository', () => {
  describe('findById / findByReturnNumber', () => {
    it('queries by id', async () => {
      const qb = makeQB({ first: { id: 'r1' } });
      const db = makeDb(qb);
      const repo = new ReturnRepository(db);
      expect(await repo.findById('r1')).toEqual({ id: 'r1' });
      expect(qb.where).toHaveBeenCalledWith({ id: 'r1' });
    });
    it('queries by return_number', async () => {
      const qb = makeQB({ first: { id: 'r2' } });
      const repo = new ReturnRepository(makeDb(qb));
      await repo.findByReturnNumber('RET-1');
      expect(qb.where).toHaveBeenCalledWith({ return_number: 'RET-1' });
    });
  });

  describe('findBySaleId / findByCustomerId', () => {
    it('orders by created_at desc', async () => {
      const qb = makeQB({ list: [{ id: 'a' }] });
      const repo = new ReturnRepository(makeDb(qb));
      await repo.findBySaleId('s1');
      expect(qb.where).toHaveBeenCalledWith({ sale_id: 's1' });
      expect(qb.orderBy).toHaveBeenCalledWith('created_at', 'desc');
    });
    it('filters by customer_id', async () => {
      const qb = makeQB({ list: [] });
      const repo = new ReturnRepository(makeDb(qb));
      await repo.findByCustomerId('c1');
      expect(qb.where).toHaveBeenCalledWith({ customer_id: 'c1' });
    });
  });

  describe('findAll', () => {
    it('applies filters and pagination', async () => {
      const qb = makeQB({ count: { c: '7' }, list: [{ id: 'x' }] });
      const repo = new ReturnRepository(makeDb(qb));
      const res = await repo.findAll({
        search: 'foo', status: 'pending' as any, returnType: 'partial' as any,
        customerId: 'c', saleId: 's', dateFrom: '2026-01-01', dateTo: '2026-12-31',
        page: 2, limit: 5, sortBy: 'returnDate', sortOrder: 'asc',
      });
      expect(qb.whereILike).toHaveBeenCalledWith('return_number', '%foo%');
      expect(qb.where).toHaveBeenCalledWith({ status: 'pending' });
      expect(qb.where).toHaveBeenCalledWith({ return_type: 'partial' });
      expect(qb.where).toHaveBeenCalledWith('return_date', '>=', '2026-01-01');
      expect(qb.where).toHaveBeenCalledWith('return_date', '<=', '2026-12-31');
      expect(qb.orderBy).toHaveBeenCalledWith('return_date', 'asc');
      expect(qb.limit).toHaveBeenCalledWith(5);
      expect(qb.offset).toHaveBeenCalledWith(5);
      expect(res).toEqual({ data: [{ id: 'x' }], total: 7, page: 2, limit: 5, totalPages: 2 });
    });

    it('uses defaults when no filters supplied', async () => {
      const qb = makeQB({ count: { c: '0' }, list: [] });
      const repo = new ReturnRepository(makeDb(qb));
      const res = await repo.findAll();
      expect(qb.orderBy).toHaveBeenCalledWith('created_at', 'desc');
      expect(res.page).toBe(1);
      expect(res.limit).toBe(20);
      expect(res.totalPages).toBe(0);
    });
  });

  describe('create / update / delete', () => {
    it('insert returns first row', async () => {
      const qb = makeQB({ insertReturning: [{ id: 'r1' }] });
      const repo = new ReturnRepository(makeDb(qb));
      expect(await repo.create({ a: 1 })).toEqual({ id: 'r1' });
    });
    it('insert uses trx when provided', async () => {
      const qb = makeQB({ insertReturning: [{ id: 'r1' }] });
      const trx: any = jest.fn(() => qb);
      const repo = new ReturnRepository(makeDb(makeQB()));
      await repo.create({}, trx);
      expect(trx).toHaveBeenCalled();
    });
    it('update returns updated row', async () => {
      const qb = makeQB({ updateReturning: [{ id: 'r1', a: 2 }] });
      const repo = new ReturnRepository(makeDb(qb));
      expect(await repo.update('r1', { a: 2 })).toEqual({ id: 'r1', a: 2 });
    });
    it('update returns null when no row', async () => {
      const qb = makeQB({ updateReturning: [] });
      const repo = new ReturnRepository(makeDb(qb));
      expect(await repo.update('r1', {})).toBeNull();
    });
    it('delete returns true when rows deleted', async () => {
      const qb = makeQB({ delete: 1 });
      const repo = new ReturnRepository(makeDb(qb));
      expect(await repo.delete('r1')).toBe(true);
    });
    it('delete returns false when no rows', async () => {
      const qb = makeQB({ delete: 0 });
      const repo = new ReturnRepository(makeDb(qb));
      expect(await repo.delete('r1')).toBe(false);
    });
  });

  describe('generateReturnNumber', () => {
    it('starts sequence at 0001 with no prior records', async () => {
      const qb = makeQB({ first: null });
      const repo = new ReturnRepository(makeDb(qb));
      const num = await repo.generateReturnNumber();
      expect(num).toMatch(/^RET-\d{6}-0001$/);
    });
    it('increments from last sequence', async () => {
      const qb = makeQB({ first: { return_number: 'RET-202605-0042' } });
      const repo = new ReturnRepository(makeDb(qb));
      const num = await repo.generateReturnNumber();
      expect(num.endsWith('-0043')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('aggregates with date range', async () => {
      const qb = makeQB({ select: [{ totalReturns: 3 }] });
      const repo = new ReturnRepository(makeDb(qb));
      const res = await repo.getStats('2026-01-01', '2026-12-31');
      expect(qb.where).toHaveBeenCalledWith('return_date', '>=', '2026-01-01');
      expect(qb.where).toHaveBeenCalledWith('return_date', '<=', '2026-12-31');
      expect(res).toEqual({ totalReturns: 3 });
    });
    it('aggregates without date range', async () => {
      const qb = makeQB({ select: [{ totalReturns: 0 }] });
      const repo = new ReturnRepository(makeDb(qb));
      await repo.getStats();
      expect(qb.where).not.toHaveBeenCalled();
    });
  });

  describe('items', () => {
    it('findItemsByReturnId orders by created_at asc', async () => {
      const qb = makeQB({ list: [{ id: 'i1' }] });
      const repo = new ReturnRepository(makeDb(qb));
      await repo.findItemsByReturnId('r1');
      expect(qb.where).toHaveBeenCalledWith({ return_id: 'r1' });
      expect(qb.orderBy).toHaveBeenCalledWith('created_at', 'asc');
    });
    it('createItems returns [] when empty', async () => {
      const repo = new ReturnRepository(makeDb(makeQB()));
      expect(await repo.createItems([])).toEqual([]);
    });
    it('createItems inserts and returns rows', async () => {
      const qb = makeQB({ insertReturning: [{ id: 'i1' }] });
      const repo = new ReturnRepository(makeDb(qb));
      const rows = await repo.createItems([{ a: 1 }]);
      expect(rows).toEqual([{ id: 'i1' }]);
    });
    it('deleteItemsByReturnId deletes by return_id', async () => {
      const qb = makeQB({ delete: 2 });
      const repo = new ReturnRepository(makeDb(qb));
      const n = await repo.deleteItemsByReturnId('r1');
      expect(qb.where).toHaveBeenCalledWith({ return_id: 'r1' });
      expect(n).toBe(2);
    });
    it('getSaleItemReturnedQty parses sum result', async () => {
      const qb = makeQB({ sum: { total: '4' } });
      const repo = new ReturnRepository(makeDb(qb));
      expect(await repo.getSaleItemReturnedQty('si-1')).toBe(4);
    });
    it('getSaleItemReturnedQty defaults to 0 when null', async () => {
      const qb = makeQB({ sum: undefined });
      const repo = new ReturnRepository(makeDb(qb));
      expect(await repo.getSaleItemReturnedQty('si-1')).toBe(0);
    });
  });

  describe('withinTransaction', () => {
    it('passes trx to callback and returns result', async () => {
      const repo = new ReturnRepository(makeDb(makeQB()));
      const res = await repo.withinTransaction(async (trx) => `got:${trx}`);
      expect(res).toBe('got:trx');
    });
  });
});
