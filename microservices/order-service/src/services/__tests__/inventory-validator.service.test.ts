/**
 * Unit Tests for InventoryValidatorService
 * Tests saga pattern behavior, event emission, and error handling
 */

import { InventoryValidatorService } from '../inventory-validator.service';
import { SaleItemDTO } from '../../dto';
import * as InventorySagaModule from '../../events/InventorySaga';
import { SaleEventEmitter } from '../../events/sale.events';

// Mock the SaleEventEmitter
jest.mock('../../events/sale.events', () => ({
  SaleEventEmitter: {
    emitSagaStarted: jest.fn(),
    emitSagaCompleted: jest.fn(),
    emitSagaFailed: jest.fn(),
  },
}));

// Mock data factory
const createMockSaleItem = (overrides: Partial<SaleItemDTO> = {}): SaleItemDTO => ({
  product_id: 'prod-001',
  product_name: 'Test Product',
  product_sku: 'SKU-001',
  quantity: 10,
  unit_price: 100,
  discount_amount: 0,
  tax_amount: 10,
  ...overrides,
});

describe('InventoryValidatorService', () => {
  let service: InventoryValidatorService;
  let mockSaga: jest.Mocked<InventorySagaModule.InventorySaga>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create mock saga
    mockSaga = {
      validateAndReserve: jest.fn(),
      checkOnly: jest.fn(),
    } as any;

    // Mock createInventorySaga to return our mock
    jest.spyOn(InventorySagaModule, 'createInventorySaga').mockReturnValue(mockSaga);

    service = new InventoryValidatorService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('validateInventory', () => {
    describe('successful validation', () => {
      it('should return success when all items are available', async () => {
        const items: SaleItemDTO[] = [
          createMockSaleItem({ product_id: 'prod-001', quantity: 5 }),
          createMockSaleItem({ product_id: 'prod-002', quantity: 3 }),
        ];

        const mockResult = {
          success: true,
          data: {
            success: true,
            reservation_id: 'res-12345',
            items: items.map(i => ({
              product_id: i.product_id,
              product_name: i.product_name,
              quantity: i.quantity,
              unit_price: i.unit_price,
            })),
          },
        };

        mockSaga.validateAndReserve.mockResolvedValue(mockResult);

        const result = await service.validateInventory(items);

        expect(result.success).toBe(true);
        expect(result.reservation_id).toBe('res-12345');
      });

      it('should emit saga started event with correct payload', async () => {
        const items: SaleItemDTO[] = [
          createMockSaleItem(),
          createMockSaleItem({ product_id: 'prod-002' }),
        ];

        mockSaga.validateAndReserve.mockResolvedValue({
          success: true,
          data: { success: true, items: [], reservation_id: 'res-123' },
        });

        await service.validateInventory(items);

        expect(SaleEventEmitter.emitSagaStarted).toHaveBeenCalledWith({
          action: 'validate_inventory',
          items_count: 2,
        });
      });

      it('should emit saga completed event on success', async () => {
        const items: SaleItemDTO[] = [createMockSaleItem()];

        mockSaga.validateAndReserve.mockResolvedValue({
          success: true,
          data: { success: true, items: [], reservation_id: 'res-456' },
        });

        await service.validateInventory(items);

        expect(SaleEventEmitter.emitSagaCompleted).toHaveBeenCalledWith({
          action: 'validate_inventory',
          reservation_id: 'res-456',
        });
      });

      it('should map sale items to saga items correctly', async () => {
        const items: SaleItemDTO[] = [
          createMockSaleItem({
            product_id: 'prod-special',
            product_name: 'Special Product',
            product_sku: 'SKU-SPECIAL',
            quantity: 25,
            unit_price: 199.99,
            discount_amount: 10,
            tax_amount: 15,
          }),
        ];

        mockSaga.validateAndReserve.mockResolvedValue({
          success: true,
          data: { success: true, items: [], reservation_id: 'res-789' },
        });

        await service.validateInventory(items);

        expect(mockSaga.validateAndReserve).toHaveBeenCalledWith([
          expect.objectContaining({
            product_id: 'prod-special',
            product_name: 'Special Product',
            product_sku: 'SKU-SPECIAL',
            quantity: 25,
            unit_price: 199.99,
            discount_amount: 10,
            tax_amount: 15,
          }),
        ]);
      });
    });

    describe('failed validation', () => {
      it('should return failure when items are unavailable', async () => {
        const items: SaleItemDTO[] = [
          createMockSaleItem({ product_id: 'prod-001', quantity: 100 }),
        ];

        const mockResult = {
          success: false,
          errors: ['Insufficient stock for prod-001'],
          compensated: true,
          data: {
            success: false,
            items: [],
            unavailable_items: [
              {
                product_id: 'prod-001',
                product_name: 'Test Product',
                requested_quantity: 100,
                available_quantity: 50,
              },
            ],
          },
        };

        mockSaga.validateAndReserve.mockResolvedValue(mockResult);

        const result = await service.validateInventory(items);

        expect(result.success).toBe(false);
        expect(result.unavailable_items).toHaveLength(1);
        expect(result.unavailable_items![0].product_id).toBe('prod-001');
      });

      it('should emit saga failed event on failure', async () => {
        const items: SaleItemDTO[] = [createMockSaleItem()];

        mockSaga.validateAndReserve.mockResolvedValue({
          success: false,
          errors: ['Stock unavailable'],
          compensated: true,
          data: { success: false, items: [], unavailable_items: [] },
        });

        await service.validateInventory(items);

        expect(SaleEventEmitter.emitSagaFailed).toHaveBeenCalledWith({
          action: 'validate_inventory',
          errors: ['Stock unavailable'],
          compensated: true,
        });
      });

      it('should handle empty errors array gracefully', async () => {
        const items: SaleItemDTO[] = [createMockSaleItem()];

        mockSaga.validateAndReserve.mockResolvedValue({
          success: false,
          compensated: false,
          data: { success: false, items: [], unavailable_items: [] },
        });

        await service.validateInventory(items);

        expect(SaleEventEmitter.emitSagaFailed).toHaveBeenCalledWith({
          action: 'validate_inventory',
          errors: [],
          compensated: false,
        });
      });

      it('should return default result when saga returns no data', async () => {
        const items: SaleItemDTO[] = [createMockSaleItem()];

        mockSaga.validateAndReserve.mockResolvedValue({
          success: false,
          errors: ['Unknown error'],
          compensated: false,
        });

        const result = await service.validateInventory(items);

        expect(result.success).toBe(false);
        expect(result.items).toBeDefined();
        expect(result.unavailable_items).toEqual([]);
      });
    });

    describe('edge cases', () => {
      it('should handle empty items array', async () => {
        const items: SaleItemDTO[] = [];

        mockSaga.validateAndReserve.mockResolvedValue({
          success: true,
          data: { success: true, items: [], reservation_id: 'res-empty' },
        });

        const result = await service.validateInventory(items);

        expect(SaleEventEmitter.emitSagaStarted).toHaveBeenCalledWith({
          action: 'validate_inventory',
          items_count: 0,
        });
        expect(result.success).toBe(true);
      });

      it('should handle single item validation', async () => {
        const items: SaleItemDTO[] = [createMockSaleItem()];

        mockSaga.validateAndReserve.mockResolvedValue({
          success: true,
          data: { success: true, items: [], reservation_id: 'res-single' },
        });

        const result = await service.validateInventory(items);

        expect(result.success).toBe(true);
        expect(mockSaga.validateAndReserve).toHaveBeenCalledTimes(1);
      });

      it('should handle items with optional fields undefined', async () => {
        const items: SaleItemDTO[] = [
          {
            product_id: 'prod-minimal',
            product_name: 'Minimal Product',
            quantity: 1,
            unit_price: 10,
          },
        ];

        mockSaga.validateAndReserve.mockResolvedValue({
          success: true,
          data: { success: true, items: [], reservation_id: 'res-minimal' },
        });

        await service.validateInventory(items);

        expect(mockSaga.validateAndReserve).toHaveBeenCalledWith([
          expect.objectContaining({
            product_id: 'prod-minimal',
            product_sku: undefined,
            discount_amount: undefined,
            tax_amount: undefined,
          }),
        ]);
      });
    });
  });

  describe('checkInventoryOnly', () => {
    it('should return availability status without reservation', async () => {
      const items: SaleItemDTO[] = [
        createMockSaleItem({ product_id: 'prod-001', quantity: 5 }),
      ];

      mockSaga.checkOnly.mockResolvedValue({
        success: true,
        available: true,
        items: [
          {
            product_id: 'prod-001',
            requested_quantity: 5,
            available_quantity: 100,
            is_available: true,
          },
        ],
      });

      const result = await service.checkInventoryOnly(items);

      expect(result.available).toBe(true);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].is_available).toBe(true);
    });

    it('should return unavailable status correctly', async () => {
      const items: SaleItemDTO[] = [
        createMockSaleItem({ product_id: 'prod-001', quantity: 200 }),
      ];

      mockSaga.checkOnly.mockResolvedValue({
        success: true,
        available: false,
        items: [
          {
            product_id: 'prod-001',
            requested_quantity: 200,
            available_quantity: 50,
            is_available: false,
          },
        ],
      });

      const result = await service.checkInventoryOnly(items);

      expect(result.available).toBe(false);
      expect(result.items[0].is_available).toBe(false);
      expect(result.items[0].available_quantity).toBe(50);
    });

    it('should not emit any saga events', async () => {
      const items: SaleItemDTO[] = [createMockSaleItem()];

      mockSaga.checkOnly.mockResolvedValue({
        success: true,
        available: true,
        items: [],
      });

      await service.checkInventoryOnly(items);

      expect(SaleEventEmitter.emitSagaStarted).not.toHaveBeenCalled();
      expect(SaleEventEmitter.emitSagaCompleted).not.toHaveBeenCalled();
      expect(SaleEventEmitter.emitSagaFailed).not.toHaveBeenCalled();
    });

    it('should map items correctly to saga format', async () => {
      const items: SaleItemDTO[] = [
        createMockSaleItem({
          product_id: 'check-prod',
          quantity: 15,
        }),
      ];

      mockSaga.checkOnly.mockResolvedValue({
        success: true,
        available: true,
        items: [],
      });

      await service.checkInventoryOnly(items);

      expect(mockSaga.checkOnly).toHaveBeenCalledWith([
        expect.objectContaining({
          product_id: 'check-prod',
          quantity: 15,
        }),
      ]);
    });

    it('should handle multiple items check', async () => {
      const items: SaleItemDTO[] = [
        createMockSaleItem({ product_id: 'prod-001', quantity: 5 }),
        createMockSaleItem({ product_id: 'prod-002', quantity: 10 }),
        createMockSaleItem({ product_id: 'prod-003', quantity: 15 }),
      ];

      mockSaga.checkOnly.mockResolvedValue({
        success: true,
        available: true,
        items: [
          { product_id: 'prod-001', requested_quantity: 5, available_quantity: 100, is_available: true },
          { product_id: 'prod-002', requested_quantity: 10, available_quantity: 50, is_available: true },
          { product_id: 'prod-003', requested_quantity: 15, available_quantity: 20, is_available: true },
        ],
      });

      const result = await service.checkInventoryOnly(items);

      expect(result.items).toHaveLength(3);
      expect(result.available).toBe(true);
    });

    it('should return false when any item is unavailable', async () => {
      const items: SaleItemDTO[] = [
        createMockSaleItem({ product_id: 'prod-001', quantity: 5 }),
        createMockSaleItem({ product_id: 'prod-002', quantity: 200 }),
      ];

      mockSaga.checkOnly.mockResolvedValue({
        success: true,
        available: false,
        items: [
          { product_id: 'prod-001', requested_quantity: 5, available_quantity: 100, is_available: true },
          { product_id: 'prod-002', requested_quantity: 200, available_quantity: 50, is_available: false },
        ],
      });

      const result = await service.checkInventoryOnly(items);

      expect(result.available).toBe(false);
      expect(result.items.filter(i => !i.is_available)).toHaveLength(1);
    });
  });

  describe('saga lifecycle', () => {
    it('should create new saga instance for each validation call', async () => {
      const items: SaleItemDTO[] = [createMockSaleItem()];
      const createSagaSpy = jest.spyOn(InventorySagaModule, 'createInventorySaga');

      mockSaga.validateAndReserve.mockResolvedValue({
        success: true,
        data: { success: true, items: [], reservation_id: 'res-1' },
      });

      await service.validateInventory(items);
      await service.validateInventory(items);

      // Called once in constructor + twice in validateInventory
      expect(createSagaSpy).toHaveBeenCalledTimes(3);
    });

    it('should create new saga instance for each check call', async () => {
      const items: SaleItemDTO[] = [createMockSaleItem()];
      const createSagaSpy = jest.spyOn(InventorySagaModule, 'createInventorySaga');

      mockSaga.checkOnly.mockResolvedValue({
        success: true,
        available: true,
        items: [],
      });

      await service.checkInventoryOnly(items);
      await service.checkInventoryOnly(items);

      // Called once in constructor + twice in checkInventoryOnly
      expect(createSagaSpy).toHaveBeenCalledTimes(3);
    });
  });
});
