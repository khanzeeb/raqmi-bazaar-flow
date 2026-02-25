import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InventoryService } from '../modules/inventory/inventory.service';
import { InventoryRepository } from '../modules/inventory/inventory.repository';
import { StockStatus } from '../modules/inventory/dto';

describe('InventoryService', () => {
  let service: InventoryService;
  let repo: jest.Mocked<InventoryRepository>;

  const mockItem = {
    id: 'inv-1',
    product_id: 'prod-1',
    product_name: 'Widget',
    sku: 'WDG-001',
    category: 'parts',
    current_stock: 50,
    minimum_stock: 10,
    maximum_stock: 100,
    unit_cost: 5,
    unit_price: 10,
    location: 'WH-A',
    supplier: 'Acme',
    status: StockStatus.IN_STOCK,
    notes: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      findById: jest.fn(),
      findByProductId: jest.fn(),
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
        InventoryService,
        { provide: InventoryRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get(InventoryService);
    repo = module.get(InventoryRepository);
  });

  // ─── getById ───

  it('returns item when found', async () => {
    repo.findById.mockResolvedValue(mockItem);
    const result = await service.getById('inv-1');
    expect(result).toEqual(mockItem);
    expect(repo.findById).toHaveBeenCalledWith('inv-1');
  });

  it('throws NotFoundException when item not found', async () => {
    repo.findById.mockResolvedValue(undefined);
    await expect(service.getById('missing')).rejects.toThrow(NotFoundException);
  });

  // ─── getAll ───

  it('delegates to repo.findAll with filters', async () => {
    const paginated = { data: [mockItem], total: 1, page: 1, limit: 20, totalPages: 1 };
    repo.findAll.mockResolvedValue(paginated);
    const result = await service.getAll({ category: 'parts' });
    expect(result).toEqual(paginated);
    expect(repo.findAll).toHaveBeenCalledWith({ category: 'parts' });
  });

  // ─── create ───

  it('creates item with derived status', async () => {
    repo.create.mockResolvedValue(mockItem);
    const dto = {
      productId: 'prod-1',
      productName: 'Widget',
      sku: 'WDG-001',
      currentStock: 50,
      minimumStock: 10,
    };
    await service.create(dto);
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        product_id: 'prod-1',
        status: StockStatus.IN_STOCK,
      }),
    );
  });

  it('derives OUT_OF_STOCK when stock is 0', async () => {
    repo.create.mockResolvedValue({ ...mockItem, status: StockStatus.OUT_OF_STOCK });
    await service.create({
      productId: 'p', productName: 'P', sku: 'S', currentStock: 0,
    });
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: StockStatus.OUT_OF_STOCK }),
    );
  });

  it('derives LOW_STOCK when stock equals minimum', async () => {
    repo.create.mockResolvedValue({ ...mockItem, status: StockStatus.LOW_STOCK });
    await service.create({
      productId: 'p', productName: 'P', sku: 'S', currentStock: 5, minimumStock: 5,
    });
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: StockStatus.LOW_STOCK }),
    );
  });

  // ─── update ───

  it('updates item after verifying existence', async () => {
    repo.findById.mockResolvedValue(mockItem);
    repo.update.mockResolvedValue({ ...mockItem, product_name: 'Updated' });
    const result = await service.update('inv-1', { productName: 'Updated' });
    expect(result!.product_name).toBe('Updated');
  });

  it('throws NotFoundException on update of missing item', async () => {
    repo.findById.mockResolvedValue(undefined);
    await expect(service.update('nope', { productName: 'x' })).rejects.toThrow(NotFoundException);
  });

  // ─── remove ───

  it('deletes item after verifying existence', async () => {
    repo.findById.mockResolvedValue(mockItem);
    repo.delete.mockResolvedValue(true);
    expect(await service.remove('inv-1')).toBe(true);
  });

  // ─── adjustStock ───

  it('adjusts stock within transaction', async () => {
    repo.findById.mockResolvedValue(mockItem);
    // Mock withinTransaction to just call the callback with a mock trx
    const mockTrx = jest.fn().mockImplementation((table: string) => ({
      where: jest.fn().mockReturnValue({
        update: jest.fn().mockResolvedValue(1),
      }),
      insert: jest.fn().mockResolvedValue([{}]),
    }));
    (mockTrx as any).fn = { now: jest.fn() };
    repo.withinTransaction.mockImplementation(async (cb) => cb(mockTrx as any));

    const result = await service.adjustStock('inv-1', { quantity: 10, reason: 'Restock' });
    expect(result.current_stock).toBe(60);
    expect(repo.withinTransaction).toHaveBeenCalled();
  });

  it('throws BadRequestException when stock goes negative', async () => {
    repo.findById.mockResolvedValue(mockItem);
    repo.withinTransaction.mockImplementation(async (cb) => {
      const mockTrx: any = jest.fn();
      mockTrx.fn = { now: jest.fn() };
      return cb(mockTrx);
    });

    await expect(
      service.adjustStock('inv-1', { quantity: -100, reason: 'Over-deduct' }),
    ).rejects.toThrow(BadRequestException);
  });

  // ─── transferStock ───

  it('throws BadRequestException on insufficient transfer stock', async () => {
    repo.findById.mockResolvedValue({ ...mockItem, current_stock: 5 });
    repo.withinTransaction.mockImplementation(async (cb) => {
      const mockTrx: any = jest.fn();
      mockTrx.fn = { now: jest.fn() };
      return cb(mockTrx);
    });

    await expect(
      service.transferStock('inv-1', { toLocation: 'WH-B', quantity: 20 }),
    ).rejects.toThrow(BadRequestException);
  });

  // ─── domain queries ───

  it('delegates getLowStockItems', async () => {
    repo.findLowStock.mockResolvedValue([mockItem]);
    const result = await service.getLowStockItems(15);
    expect(repo.findLowStock).toHaveBeenCalledWith(15);
    expect(result).toHaveLength(1);
  });

  it('delegates getStats', async () => {
    const stats = { totalItems: 10, totalValue: 500, lowStockItems: 2, outOfStockItems: 1 };
    repo.getStats.mockResolvedValue(stats);
    const result = await service.getStats({ category: 'parts' });
    expect(result).toEqual(stats);
  });

  it('delegates getMovements', async () => {
    repo.getMovements.mockResolvedValue([]);
    await service.getMovements('prod-1');
    expect(repo.getMovements).toHaveBeenCalledWith('prod-1');
  });
});
