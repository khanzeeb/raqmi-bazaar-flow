import { Test, TestingModule } from '@nestjs/testing';
import { ReservationService } from '../modules/inventory/reservation.service';
import { InventoryRepository } from '../modules/inventory/inventory.repository';
import { BadRequestException } from '@nestjs/common';

describe('ReservationService', () => {
  let service: ReservationService;
  let repo: jest.Mocked<InventoryRepository>;

  beforeEach(async () => {
    const mockRepo = {
      findByProductId: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findLowStock: jest.fn(),
      getStats: jest.fn(),
      createMovement: jest.fn(),
      getMovements: jest.fn(),
      withinTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        { provide: InventoryRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get(ReservationService);
    repo = module.get(InventoryRepository);
  });

  describe('checkStock', () => {
    it('returns available=true when all items have stock', async () => {
      repo.findByProductId.mockResolvedValue({ current_stock: 100 });
      const result = await service.checkStock({
        items: [{ product_id: 'p1', quantity: 10 }],
      });
      expect(result.available).toBe(true);
      expect(result.items[0].is_available).toBe(true);
    });

    it('returns available=false when stock is insufficient', async () => {
      repo.findByProductId.mockResolvedValue({ current_stock: 5 });
      const result = await service.checkStock({
        items: [{ product_id: 'p1', quantity: 10 }],
      });
      expect(result.available).toBe(false);
      expect(result.items[0].is_available).toBe(false);
    });

    it('handles missing product as 0 stock', async () => {
      repo.findByProductId.mockResolvedValue(null);
      const result = await service.checkStock({
        items: [{ product_id: 'missing', quantity: 1 }],
      });
      expect(result.available).toBe(false);
    });
  });

  describe('reserve', () => {
    it('creates reservation when stock available', async () => {
      repo.findByProductId.mockResolvedValue({ current_stock: 100 });
      const result = await service.reserve({
        items: [{ product_id: 'p1', quantity: 5 }],
        sale_id: 'sale-1',
      });
      expect(result.reservation_id).toBeDefined();
      expect(result.sale_id).toBe('sale-1');
      expect(result.items[0].reserved_quantity).toBe(5);
    });

    it('throws BadRequestException when stock insufficient', async () => {
      repo.findByProductId.mockResolvedValue({ current_stock: 2 });
      await expect(
        service.reserve({ items: [{ product_id: 'p1', quantity: 10 }] }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('release', () => {
    it('releases an active reservation', async () => {
      repo.findByProductId.mockResolvedValue({ current_stock: 100 });
      const reserved = await service.reserve({
        items: [{ product_id: 'p1', quantity: 5 }],
      });

      const result = await service.release({
        reservation_id: reserved.reservation_id,
      });
      expect(result.message).toBe('Inventory released successfully');
    });

    it('handles non-existent reservation gracefully', async () => {
      const result = await service.release({ reservation_id: 'non-existent' });
      expect(result.message).toBe('Inventory released successfully');
    });
  });
});
