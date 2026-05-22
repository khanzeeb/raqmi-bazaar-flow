import { ReturnMapper } from '../return.mapper';
import {
  CreateReturnDto, UpdateReturnDto, CreateReturnItemDto,
  ReturnType, ReturnReason, ReturnStatus, RefundStatus, ItemCondition,
} from '../dto';

const item = (over: Partial<CreateReturnItemDto> = {}): CreateReturnItemDto => ({
  saleItemId: '11111111-1111-1111-1111-111111111111',
  productId: '22222222-2222-2222-2222-222222222222',
  productName: 'Widget',
  productSku: 'W-1',
  quantityReturned: 2,
  originalQuantity: 5,
  unitPrice: 10,
  condition: ItemCondition.GOOD,
  ...over,
});

const dto = (over: Partial<CreateReturnDto> = {}): CreateReturnDto => ({
  saleId: '33333333-3333-3333-3333-333333333333',
  customerId: '44444444-4444-4444-4444-444444444444',
  returnDate: '2026-05-22',
  returnType: ReturnType.PARTIAL,
  reason: ReturnReason.DEFECTIVE,
  notes: 'n',
  items: [item()],
  ...over,
});

describe('ReturnMapper', () => {
  describe('calculateTotal', () => {
    it('sums qty*price', () => {
      expect(ReturnMapper.calculateTotal([item({ quantityReturned: 2, unitPrice: 10 }), item({ quantityReturned: 1, unitPrice: 5 })])).toBe(25);
    });
    it('returns 0 for empty', () => {
      expect(ReturnMapper.calculateTotal([])).toBe(0);
    });
  });

  describe('toRow', () => {
    it('maps DTO to snake_case row with defaults', () => {
      const row = ReturnMapper.toRow(dto(), 'RET-202605-0001', 20);
      expect(row).toMatchObject({
        return_number: 'RET-202605-0001',
        sale_id: dto().saleId,
        customer_id: dto().customerId,
        return_date: '2026-05-22',
        return_type: 'partial',
        reason: 'defective',
        total_amount: 20,
        refund_amount: 0,
        refund_status: 'pending',
        status: 'pending',
      });
    });
    it('nulls missing notes', () => {
      const row = ReturnMapper.toRow(dto({ notes: undefined }), 'X', 0);
      expect(row.notes).toBeNull();
    });
  });

  describe('updateToRow', () => {
    it('only includes provided fields', () => {
      const u: UpdateReturnDto = { status: ReturnStatus.APPROVED, refundStatus: RefundStatus.PROCESSED };
      expect(ReturnMapper.updateToRow(u)).toEqual({ status: 'approved', refund_status: 'processed' });
    });
    it('returns empty object when nothing provided', () => {
      expect(ReturnMapper.updateToRow({})).toEqual({});
    });
  });

  describe('itemToRow', () => {
    it('computes line_total and maps fields', () => {
      const row = ReturnMapper.itemToRow(item({ quantityReturned: 3, unitPrice: 7 }), 'ret-1');
      expect(row.line_total).toBe(21);
      expect(row.return_id).toBe('ret-1');
      expect(row.condition).toBe('good');
    });
  });
});
