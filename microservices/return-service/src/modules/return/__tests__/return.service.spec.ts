import { Test } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ReturnService } from '../return.service';
import { ReturnRepository } from '../return.repository';
import {
  CreateReturnDto, ReturnType, ReturnReason, ItemCondition, ReturnStatus,
} from '../dto';

const baseDto = (): CreateReturnDto => ({
  saleId: 'sale-1',
  customerId: 'cust-1',
  returnDate: '2026-05-22',
  returnType: ReturnType.PARTIAL,
  reason: ReturnReason.DEFECTIVE,
  items: [{
    saleItemId: 'si-1',
    productId: 'p-1',
    productName: 'Widget',
    quantityReturned: 2,
    originalQuantity: 5,
    unitPrice: 10,
    condition: ItemCondition.GOOD,
  }],
});

const makeRepoMock = () => ({
  findById: jest.fn(),
  findBySaleId: jest.fn(),
  findByCustomerId: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  generateReturnNumber: jest.fn().mockResolvedValue('RET-202605-0001'),
  getStats: jest.fn(),
  findItemsByReturnId: jest.fn().mockResolvedValue([]),
  createItems: jest.fn().mockResolvedValue([]),
  getSaleItemReturnedQty: jest.fn().mockResolvedValue(0),
  withinTransaction: jest.fn(async (cb: any) => cb({})),
});

describe('ReturnService', () => {
  let service: ReturnService;
  let repo: ReturnType extends never ? never : ReturnType extends any ? any : any;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        ReturnService,
        { provide: ReturnRepository, useValue: makeRepoMock() },
      ],
    }).compile();
    service = mod.get(ReturnService);
    repo = mod.get(ReturnRepository) as any;
  });

  describe('getById', () => {
    it('returns return with items', async () => {
      repo.findById.mockResolvedValue({ id: 'r1' });
      repo.findItemsByReturnId.mockResolvedValue([{ id: 'i1' }]);
      const res = await service.getById('r1');
      expect(res).toEqual({ id: 'r1', items: [{ id: 'i1' }] });
    });
    it('throws NotFound when missing', async () => {
      repo.findById.mockResolvedValue(undefined);
      await expect(service.getById('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAll / getBySaleId / getByCustomerId', () => {
    it('delegates', async () => {
      repo.findAll.mockResolvedValue({ data: [] });
      repo.findBySaleId.mockResolvedValue([]);
      repo.findByCustomerId.mockResolvedValue([]);
      await service.getAll({});
      await service.getBySaleId('s1');
      await service.getByCustomerId('c1');
      expect(repo.findAll).toHaveBeenCalled();
      expect(repo.findBySaleId).toHaveBeenCalledWith('s1');
      expect(repo.findByCustomerId).toHaveBeenCalledWith('c1');
    });
  });

  describe('create', () => {
    it('creates with generated number and items', async () => {
      repo.create.mockResolvedValue({ id: 'r1' });
      repo.createItems.mockResolvedValue([{ id: 'i1' }]);
      const res = await service.create(baseDto());
      expect(repo.generateReturnNumber).toHaveBeenCalled();
      expect(repo.create).toHaveBeenCalled();
      expect(repo.createItems).toHaveBeenCalled();
      expect(res).toEqual({ id: 'r1', items: [{ id: 'i1' }] });
    });
    it('rejects when returned > original', async () => {
      const dto = baseDto();
      dto.items[0].quantityReturned = 10;
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
    it('rejects when cumulative exceeds original', async () => {
      repo.getSaleItemReturnedQty.mockResolvedValue(4);
      await expect(service.create(baseDto())).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('updates pending return', async () => {
      repo.findById.mockResolvedValue({ id: 'r1', status: ReturnStatus.PENDING });
      repo.update.mockResolvedValue({ id: 'r1' });
      await service.update('r1', { notes: 'x' });
      expect(repo.update).toHaveBeenCalled();
    });
    it('throws NotFound', async () => {
      repo.findById.mockResolvedValue(undefined);
      await expect(service.update('x', {})).rejects.toThrow(NotFoundException);
    });
    it('rejects updating completed', async () => {
      repo.findById.mockResolvedValue({ status: ReturnStatus.COMPLETED });
      await expect(service.update('r', {})).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('removes pending', async () => {
      repo.findById.mockResolvedValue({ status: ReturnStatus.PENDING });
      repo.delete.mockResolvedValue(true);
      await expect(service.remove('r')).resolves.toBe(true);
    });
    it('throws NotFound', async () => {
      repo.findById.mockResolvedValue(undefined);
      await expect(service.remove('r')).rejects.toThrow(NotFoundException);
    });
    it('rejects non-pending', async () => {
      repo.findById.mockResolvedValue({ status: ReturnStatus.APPROVED });
      await expect(service.remove('r')).rejects.toThrow(ConflictException);
    });
  });

  describe('approve', () => {
    it('approves pending', async () => {
      repo.findById.mockResolvedValue({ status: ReturnStatus.PENDING });
      await service.approve('r', 'u1');
      expect(repo.update).toHaveBeenCalledWith('r', expect.objectContaining({ status: 'approved', processed_by: 'u1' }));
    });
    it('throws NotFound', async () => {
      repo.findById.mockResolvedValue(undefined);
      await expect(service.approve('r')).rejects.toThrow(NotFoundException);
    });
    it('rejects non-pending', async () => {
      repo.findById.mockResolvedValue({ status: ReturnStatus.APPROVED });
      await expect(service.approve('r')).rejects.toThrow(ConflictException);
    });
  });

  describe('reject', () => {
    it('rejects pending', async () => {
      repo.findById.mockResolvedValue({ status: ReturnStatus.PENDING, notes: 'old' });
      await service.reject('r', { reason: 'no' });
      expect(repo.update).toHaveBeenCalledWith('r', expect.objectContaining({ status: 'rejected', notes: 'no' }));
    });
    it('throws NotFound', async () => {
      repo.findById.mockResolvedValue(undefined);
      await expect(service.reject('r', {})).rejects.toThrow(NotFoundException);
    });
    it('rejects non-pending', async () => {
      repo.findById.mockResolvedValue({ status: ReturnStatus.COMPLETED });
      await expect(service.reject('r', {})).rejects.toThrow(ConflictException);
    });
  });

  describe('process', () => {
    it('processes approved with default refund', async () => {
      repo.findById.mockResolvedValue({ status: ReturnStatus.APPROVED, total_amount: 20, processed_by: null });
      await service.process('r', {});
      expect(repo.update).toHaveBeenCalledWith('r', expect.objectContaining({
        status: 'completed', refund_status: 'processed', refund_amount: 20,
      }));
    });
    it('processes with custom refund', async () => {
      repo.findById.mockResolvedValue({ status: ReturnStatus.APPROVED, total_amount: 20 });
      await service.process('r', { refundAmount: 15 });
      expect(repo.update).toHaveBeenCalledWith('r', expect.objectContaining({ refund_amount: 15 }));
    });
    it('throws NotFound', async () => {
      repo.findById.mockResolvedValue(undefined);
      await expect(service.process('r', {})).rejects.toThrow(NotFoundException);
    });
    it('rejects when not approved', async () => {
      repo.findById.mockResolvedValue({ status: ReturnStatus.PENDING, total_amount: 10 });
      await expect(service.process('r', {})).rejects.toThrow(ConflictException);
    });
    it('rejects invalid refund amount', async () => {
      repo.findById.mockResolvedValue({ status: ReturnStatus.APPROVED, total_amount: 10 });
      await expect(service.process('r', { refundAmount: 50 })).rejects.toThrow(BadRequestException);
      await expect(service.process('r', { refundAmount: -1 })).rejects.toThrow(BadRequestException);
    });
  });

  describe('getStats', () => {
    it('delegates to repo', async () => {
      repo.getStats.mockResolvedValue({ totalReturns: 5 });
      await service.getStats('2026-01-01', '2026-12-31');
      expect(repo.getStats).toHaveBeenCalledWith('2026-01-01', '2026-12-31');
    });
  });
});
