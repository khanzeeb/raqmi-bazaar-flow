/**
 * Integration Tests for Sale Creation Flow
 * Tests the complete flow: inventory validation → sale creation → event emission
 */

import { SaleService, InventoryValidationError } from '../SaleService';
import { InventoryValidatorService } from '../inventory-validator.service';
import { SaleEventEmitter } from '../../events/sale.events';
import { serviceEventEmitter } from '../../events/EventEmitter';
import { SaleRepository } from '../../models/Sale';
import { SaleItemRepository } from '../../models/SaleItem';
import { CreateSaleDTO, SaleItemDTO } from '../../dto';
import * as InventorySagaModule from '../../events/InventorySaga';

// Mock external dependencies
jest.mock('../../events/sale.events');
jest.mock('../../events/EventEmitter', () => ({
  serviceEventEmitter: {
    emitEvent: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
  },
}));
jest.mock('../../models/Sale');
jest.mock('../../models/SaleItem');
jest.mock('../../models/PaymentAllocation');

// Test data factories
const createSaleDTO = (overrides: Partial<CreateSaleDTO> = {}): CreateSaleDTO => ({
  customer_id: 'cust-001',
  sale_date: '2024-01-15',
  due_date: '2024-02-15',
  subtotal: 1000,
  tax_amount: 100,
  discount_amount: 50,
  total_amount: 1050,
  currency: 'USD',
  notes: 'Test sale',
  ...overrides,
});

const createSaleItemDTO = (overrides: Partial<SaleItemDTO> = {}): SaleItemDTO => ({
  product_id: 'prod-001',
  product_name: 'Test Product',
  product_sku: 'SKU-001',
  quantity: 5,
  unit_price: 200,
  discount_amount: 10,
  tax_amount: 20,
  ...overrides,
});

const createMockSale = (id: string = 'sale-001') => ({
  id,
  sale_number: 'SAL-202401-0001',
  customer_id: 'cust-001',
  sale_date: '2024-01-15',
  due_date: '2024-02-15',
  subtotal: 1000,
  tax_amount: 100,
  discount_amount: 50,
  total_amount: 1050,
  paid_amount: 0,
  balance_amount: 1050,
  status: 'draft',
  payment_status: 'unpaid',
  created_at: new Date(),
  updated_at: new Date(),
});

describe('Sale Creation Flow Integration Tests', () => {
  let saleService: SaleService;
  let mockSaleRepository: jest.Mocked<SaleRepository>;
  let mockSaleItemRepository: jest.Mocked<SaleItemRepository>;
  let mockInventorySaga: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock repositories
    mockSaleRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      generateSaleNumber: jest.fn(),
      getOverdueSales: jest.fn(),
      getSaleStats: jest.fn(),
    } as any;

    mockSaleItemRepository = {
      createBulk: jest.fn(),
    } as any;

    // Mock repository constructors
    (SaleRepository as jest.Mock).mockImplementation(() => mockSaleRepository);
    (SaleItemRepository as jest.Mock).mockImplementation(() => mockSaleItemRepository);

    // Setup mock saga
    mockInventorySaga = {
      validateAndReserve: jest.fn(),
      checkOnly: jest.fn(),
    };

    jest.spyOn(InventorySagaModule, 'createInventorySaga').mockReturnValue(mockInventorySaga);

    saleService = new SaleService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Complete Sale Creation Flow', () => {
    describe('successful creation with inventory validation', () => {
      it('should create sale when all inventory is available', async () => {
        const saleData = createSaleDTO();
        const items: SaleItemDTO[] = [
          createSaleItemDTO({ product_id: 'prod-001', quantity: 5 }),
          createSaleItemDTO({ product_id: 'prod-002', quantity: 3 }),
        ];

        // Mock successful inventory validation
        mockInventorySaga.validateAndReserve.mockResolvedValue({
          success: true,
          data: {
            success: true,
            reservation_id: 'res-12345',
            items: items,
          },
        });

        mockSaleRepository.generateSaleNumber.mockResolvedValue('SAL-202401-0001');
        mockSaleRepository.create.mockResolvedValue(createMockSale());
        mockSaleItemRepository.createBulk.mockResolvedValue(undefined);

        const result = await saleService.createSale(saleData, items);

        // Verify the complete flow
        expect(mockInventorySaga.validateAndReserve).toHaveBeenCalled();
        expect(mockSaleRepository.generateSaleNumber).toHaveBeenCalled();
        expect(mockSaleRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            customer_id: 'cust-001',
            sale_number: 'SAL-202401-0001',
            status: 'draft',
            payment_status: 'unpaid',
          })
        );
        expect(mockSaleItemRepository.createBulk).toHaveBeenCalledWith('sale-001', items);
        expect(SaleEventEmitter.emitSaleCreated).toHaveBeenCalledWith(
          expect.objectContaining({
            sale_id: 'sale-001',
            sale_number: 'SAL-202401-0001',
            customer_id: 'cust-001',
            items_count: 2,
            reservation_id: 'res-12345',
          })
        );
        expect(result.id).toBe('sale-001');
      });

      it('should emit saga lifecycle events during validation', async () => {
        const saleData = createSaleDTO();
        const items: SaleItemDTO[] = [createSaleItemDTO()];

        mockInventorySaga.validateAndReserve.mockResolvedValue({
          success: true,
          data: { success: true, reservation_id: 'res-001', items },
        });
        mockSaleRepository.generateSaleNumber.mockResolvedValue('SAL-202401-0002');
        mockSaleRepository.create.mockResolvedValue(createMockSale('sale-002'));

        await saleService.createSale(saleData, items);

        expect(SaleEventEmitter.emitSagaStarted).toHaveBeenCalledWith({
          action: 'validate_inventory',
          items_count: 1,
        });
        expect(SaleEventEmitter.emitSagaCompleted).toHaveBeenCalledWith({
          action: 'validate_inventory',
          reservation_id: 'res-001',
        });
      });

      it('should create sale without items', async () => {
        const saleData = createSaleDTO();
        const items: SaleItemDTO[] = [];

        mockSaleRepository.generateSaleNumber.mockResolvedValue('SAL-202401-0003');
        mockSaleRepository.create.mockResolvedValue(createMockSale('sale-003'));

        const result = await saleService.createSale(saleData, items);

        // Should skip inventory validation
        expect(mockInventorySaga.validateAndReserve).not.toHaveBeenCalled();
        expect(mockSaleItemRepository.createBulk).not.toHaveBeenCalled();
        expect(result.id).toBe('sale-003');
      });
    });

    describe('failed creation due to inventory issues', () => {
      it('should throw InventoryValidationError when stock is insufficient', async () => {
        const saleData = createSaleDTO();
        const items: SaleItemDTO[] = [
          createSaleItemDTO({ product_id: 'prod-001', quantity: 100 }),
        ];

        mockInventorySaga.validateAndReserve.mockResolvedValue({
          success: false,
          errors: ['Insufficient stock'],
          compensated: true,
          data: {
            success: false,
            items: [],
            unavailable_items: [
              {
                product_id: 'prod-001',
                product_name: 'Test Product',
                requested_quantity: 100,
                available_quantity: 25,
              },
            ],
          },
        });

        await expect(saleService.createSale(saleData, items)).rejects.toThrow(
          InventoryValidationError
        );

        // Verify sale was not created
        expect(mockSaleRepository.create).not.toHaveBeenCalled();
        expect(SaleEventEmitter.emitSaleCreated).not.toHaveBeenCalled();
      });

      it('should include unavailable items in error', async () => {
        const saleData = createSaleDTO();
        const items: SaleItemDTO[] = [
          createSaleItemDTO({ product_id: 'prod-001', quantity: 50 }),
          createSaleItemDTO({ product_id: 'prod-002', quantity: 75 }),
        ];

        const unavailableItems = [
          { product_id: 'prod-001', requested_quantity: 50, available_quantity: 10 },
          { product_id: 'prod-002', requested_quantity: 75, available_quantity: 30 },
        ];

        mockInventorySaga.validateAndReserve.mockResolvedValue({
          success: false,
          data: { success: false, items: [], unavailable_items: unavailableItems },
        });

        try {
          await saleService.createSale(saleData, items);
          fail('Should have thrown InventoryValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(InventoryValidationError);
          expect((error as InventoryValidationError).unavailable_items).toEqual(unavailableItems);
        }
      });

      it('should emit saga failed event on validation failure', async () => {
        const saleData = createSaleDTO();
        const items: SaleItemDTO[] = [createSaleItemDTO()];

        mockInventorySaga.validateAndReserve.mockResolvedValue({
          success: false,
          errors: ['Stock unavailable'],
          compensated: true,
          data: { success: false, items: [], unavailable_items: [] },
        });

        await expect(saleService.createSale(saleData, items)).rejects.toThrow();

        expect(SaleEventEmitter.emitSagaStarted).toHaveBeenCalled();
        expect(SaleEventEmitter.emitSagaFailed).toHaveBeenCalledWith({
          action: 'validate_inventory',
          errors: ['Stock unavailable'],
          compensated: true,
        });
      });
    });

    describe('database failures', () => {
      it('should handle sale creation database error', async () => {
        const saleData = createSaleDTO();
        const items: SaleItemDTO[] = [createSaleItemDTO()];

        mockInventorySaga.validateAndReserve.mockResolvedValue({
          success: true,
          data: { success: true, reservation_id: 'res-001', items },
        });
        mockSaleRepository.generateSaleNumber.mockResolvedValue('SAL-202401-0001');
        mockSaleRepository.create.mockRejectedValue(new Error('Database connection failed'));

        await expect(saleService.createSale(saleData, items)).rejects.toThrow(
          'Database connection failed'
        );

        // Event should not be emitted on failure
        expect(SaleEventEmitter.emitSaleCreated).not.toHaveBeenCalled();
      });

      it('should handle sale item creation error', async () => {
        const saleData = createSaleDTO();
        const items: SaleItemDTO[] = [createSaleItemDTO()];

        mockInventorySaga.validateAndReserve.mockResolvedValue({
          success: true,
          data: { success: true, reservation_id: 'res-001', items },
        });
        mockSaleRepository.generateSaleNumber.mockResolvedValue('SAL-202401-0001');
        mockSaleRepository.create.mockResolvedValue(createMockSale());
        mockSaleItemRepository.createBulk.mockRejectedValue(new Error('Item creation failed'));

        await expect(saleService.createSale(saleData, items)).rejects.toThrow(
          'Item creation failed'
        );
      });
    });
  });

  describe('Sale Update Flow', () => {
    it('should validate inventory when updating items', async () => {
      const updateData = { notes: 'Updated note' };
      const newItems: SaleItemDTO[] = [
        createSaleItemDTO({ product_id: 'prod-new', quantity: 10 }),
      ];

      mockInventorySaga.validateAndReserve.mockResolvedValue({
        success: true,
        data: { success: true, reservation_id: 'res-update', items: newItems },
      });
      mockSaleRepository.findById.mockResolvedValue(createMockSale());
      mockSaleRepository.update.mockResolvedValue(createMockSale());
      mockSaleItemRepository.createBulk.mockResolvedValue(undefined);

      await saleService.updateSale('sale-001', updateData, newItems);

      expect(mockInventorySaga.validateAndReserve).toHaveBeenCalled();
      expect(mockSaleItemRepository.createBulk).toHaveBeenCalledWith('sale-001', newItems);
    });

    it('should skip inventory validation when not updating items', async () => {
      const updateData = { notes: 'Just updating notes' };

      mockSaleRepository.findById.mockResolvedValue(createMockSale());
      mockSaleRepository.update.mockResolvedValue(createMockSale());

      await saleService.updateSale('sale-001', updateData);

      expect(mockInventorySaga.validateAndReserve).not.toHaveBeenCalled();
    });

    it('should throw error when updating with unavailable items', async () => {
      const updateData = { notes: 'Updated' };
      const newItems: SaleItemDTO[] = [createSaleItemDTO({ quantity: 1000 })];

      mockInventorySaga.validateAndReserve.mockResolvedValue({
        success: false,
        data: {
          success: false,
          items: [],
          unavailable_items: [{ product_id: 'prod-001', requested_quantity: 1000, available_quantity: 50 }],
        },
      });

      await expect(saleService.updateSale('sale-001', updateData, newItems)).rejects.toThrow(
        InventoryValidationError
      );

      expect(mockSaleRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('Sale Cancellation Flow', () => {
    it('should emit cancellation event when sale is cancelled', async () => {
      mockSaleRepository.findById.mockResolvedValue(createMockSale());
      mockSaleRepository.update.mockResolvedValue({
        ...createMockSale(),
        status: 'cancelled',
      });

      await saleService.cancelSale('sale-001', 'Customer requested cancellation');

      expect(mockSaleRepository.update).toHaveBeenCalledWith(
        'sale-001',
        expect.objectContaining({
          status: 'cancelled',
          notes: 'Customer requested cancellation',
        })
      );
      expect(SaleEventEmitter.emitSaleCancelled).toHaveBeenCalledWith({
        sale_id: 'sale-001',
        reason: 'Customer requested cancellation',
      });
    });

    it('should not emit event when sale not found', async () => {
      mockSaleRepository.findById.mockResolvedValue(null);

      const result = await saleService.cancelSale('non-existent', 'Reason');

      expect(result).toBeNull();
      expect(SaleEventEmitter.emitSaleCancelled).not.toHaveBeenCalled();
    });
  });

  describe('Event Emission Verification', () => {
    it('should include all required fields in sale created event', async () => {
      const saleData = createSaleDTO({
        customer_id: 'cust-special',
        total_amount: 5000,
      });
      const items: SaleItemDTO[] = [
        createSaleItemDTO(),
        createSaleItemDTO({ product_id: 'prod-002' }),
        createSaleItemDTO({ product_id: 'prod-003' }),
      ];

      mockInventorySaga.validateAndReserve.mockResolvedValue({
        success: true,
        data: { success: true, reservation_id: 'res-special', items },
      });
      mockSaleRepository.generateSaleNumber.mockResolvedValue('SAL-202401-SPECIAL');
      mockSaleRepository.create.mockResolvedValue({
        ...createMockSale('sale-special'),
        sale_number: 'SAL-202401-SPECIAL',
        customer_id: 'cust-special',
        total_amount: 5000,
      });

      await saleService.createSale(saleData, items);

      expect(SaleEventEmitter.emitSaleCreated).toHaveBeenCalledWith({
        sale_id: 'sale-special',
        sale_number: 'SAL-202401-SPECIAL',
        customer_id: 'cust-special',
        total_amount: 5000,
        items_count: 3,
        reservation_id: 'res-special',
      });
    });
  });
});

describe('Dependency Injection', () => {
  it('should accept custom inventory validator', async () => {
    const customValidator = {
      validateInventory: jest.fn().mockResolvedValue({
        success: true,
        reservation_id: 'custom-res',
        items: [],
      }),
      checkInventoryOnly: jest.fn(),
    };

    const mockRepo = {
      create: jest.fn().mockResolvedValue(createMockSale()),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      generateSaleNumber: jest.fn().mockResolvedValue('SAL-001'),
    } as any;

    (SaleRepository as jest.Mock).mockImplementation(() => mockRepo);
    (SaleItemRepository as jest.Mock).mockImplementation(() => ({ createBulk: jest.fn() }));

    const service = new SaleService(customValidator);
    await service.createSale(createSaleDTO(), [createSaleItemDTO()]);

    expect(customValidator.validateInventory).toHaveBeenCalled();
  });
});

function createMockSale(id: string = 'sale-001') {
  return {
    id,
    sale_number: 'SAL-202401-0001',
    customer_id: 'cust-001',
    sale_date: '2024-01-15',
    due_date: '2024-02-15',
    subtotal: 1000,
    tax_amount: 100,
    discount_amount: 50,
    total_amount: 1050,
    paid_amount: 0,
    balance_amount: 1050,
    status: 'draft' as const,
    payment_status: 'unpaid' as const,
    created_at: new Date(),
    updated_at: new Date(),
  };
}
