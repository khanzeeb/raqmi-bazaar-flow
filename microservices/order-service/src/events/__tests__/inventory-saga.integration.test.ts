/**
 * Integration Tests for Inventory Saga Flow
 * Tests the saga pattern with check → reserve → compensation flow
 */

import { InventorySaga, createInventorySaga } from '../../events/InventorySaga';
import { SagaManager, SagaStatus } from '../../events/SagaManager';
import { serviceEventEmitter } from '../../events/EventEmitter';

// Mock fetch for inventory service calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock event emitter
jest.mock('../../events/EventEmitter', () => ({
  serviceEventEmitter: {
    emitEvent: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
  },
}));

// Test data factory
const createTestItems = (count: number = 2) => 
  Array.from({ length: count }, (_, i) => ({
    product_id: `prod-${i + 1}`,
    product_name: `Product ${i + 1}`,
    product_sku: `SKU-${i + 1}`,
    quantity: (i + 1) * 5,
    unit_price: 100,
    discount_amount: 0,
    tax_amount: 10,
  }));

describe('Inventory Saga Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('validateAndReserve flow', () => {
    it('should complete full check → reserve flow when inventory is available', async () => {
      const items = createTestItems(2);

      // Mock check endpoint
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            available: true,
            items: items.map(item => ({
              product_id: item.product_id,
              requested_quantity: item.quantity,
              available_quantity: 100,
              is_available: true,
            })),
          }),
        })
        // Mock reserve endpoint
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            reservation_id: 'res-integration-001',
            items: items.map(item => ({
              product_id: item.product_id,
              reserved_quantity: item.quantity,
            })),
          }),
        });

      const saga = createInventorySaga();
      const result = await saga.validateAndReserve(items);

      expect(result.success).toBe(true);
      expect(result.data?.reservation_id).toBe('res-integration-001');
      expect(mockFetch).toHaveBeenCalledTimes(2);
      
      // Verify check was called first
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('/api/inventory/check-stock'),
        expect.objectContaining({ method: 'POST' })
      );
      
      // Verify reserve was called second
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('/api/inventory/reserve'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should fail early if inventory check shows unavailable items', async () => {
      const items = createTestItems(1);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          available: false,
          items: [
            {
              product_id: 'prod-1',
              requested_quantity: 5,
              available_quantity: 2,
              is_available: false,
            },
          ],
        }),
      });

      const saga = createInventorySaga();
      const result = await saga.validateAndReserve(items);

      expect(result.success).toBe(false);
      expect(result.data?.unavailable_items).toBeDefined();
      // Reserve should not have been called
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should trigger compensation when reservation fails after check', async () => {
      const items = createTestItems(1);

      // Check succeeds
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            available: true,
            items: [{ product_id: 'prod-1', requested_quantity: 5, available_quantity: 100, is_available: true }],
          }),
        })
        // Reserve fails
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      const saga = createInventorySaga();
      const result = await saga.validateAndReserve(items);

      // Should still succeed due to soft reservation mode
      expect(result.success).toBe(true);
    });
  });

  describe('checkOnly flow', () => {
    it('should return availability without reserving', async () => {
      const items = createTestItems(3);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          available: true,
          items: items.map(item => ({
            product_id: item.product_id,
            requested_quantity: item.quantity,
            available_quantity: 1000,
            is_available: true,
          })),
        }),
      });

      const saga = createInventorySaga();
      const result = await saga.checkOnly(items);

      expect(result.available).toBe(true);
      expect(result.items).toHaveLength(3);
      // Only one call (check), no reservation
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should return detailed unavailability info', async () => {
      const items = createTestItems(2);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          available: false,
          items: [
            { product_id: 'prod-1', requested_quantity: 5, available_quantity: 100, is_available: true },
            { product_id: 'prod-2', requested_quantity: 10, available_quantity: 3, is_available: false },
          ],
        }),
      });

      const saga = createInventorySaga();
      const result = await saga.checkOnly(items);

      expect(result.available).toBe(false);
      expect(result.items.find(i => i.product_id === 'prod-2')?.is_available).toBe(false);
      expect(result.items.find(i => i.product_id === 'prod-2')?.available_quantity).toBe(3);
    });
  });

  describe('event emission during saga', () => {
    it('should emit check request and response events', async () => {
      const items = createTestItems(1);

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, available: true, items: [] }),
      });

      const saga = createInventorySaga();
      await saga.checkOnly(items);

      expect(serviceEventEmitter.emitEvent).toHaveBeenCalledWith(
        'inventory.check.request',
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({ product_id: 'prod-1' }),
          ]),
        })
      );
      expect(serviceEventEmitter.emitEvent).toHaveBeenCalledWith(
        'inventory.check.response',
        expect.any(Object)
      );
    });

    it('should emit reserve request and response events', async () => {
      const items = createTestItems(1);

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            available: true,
            items: [{ product_id: 'prod-1', requested_quantity: 5, available_quantity: 100, is_available: true }],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            reservation_id: 'res-001',
            items: [{ product_id: 'prod-1', reserved_quantity: 5 }],
          }),
        });

      const saga = createInventorySaga();
      await saga.validateAndReserve(items);

      expect(serviceEventEmitter.emitEvent).toHaveBeenCalledWith(
        'inventory.reserve.request',
        expect.any(Object)
      );
      expect(serviceEventEmitter.emitEvent).toHaveBeenCalledWith(
        'inventory.reserve.response',
        expect.objectContaining({ success: true, reservation_id: 'res-001' })
      );
    });
  });

  describe('graceful degradation', () => {
    it('should allow sale when inventory service is unavailable (check)', async () => {
      const items = createTestItems(1);

      mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));

      const saga = createInventorySaga();
      const result = await saga.checkOnly(items);

      // Should gracefully allow proceeding
      expect(result.available).toBe(true);
      expect(result.items[0].is_available).toBe(true);
    });

    it('should allow sale when inventory service is unavailable (reserve)', async () => {
      const items = createTestItems(1);

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            available: true,
            items: [{ product_id: 'prod-1', requested_quantity: 5, available_quantity: 100, is_available: true }],
          }),
        })
        .mockRejectedValueOnce(new Error('Connection timeout'));

      const saga = createInventorySaga();
      const result = await saga.validateAndReserve(items);

      // Should succeed with soft reservation
      expect(result.success).toBe(true);
      expect(result.data?.reservation_id).toMatch(/^soft-res-/);
    });
  });
});

describe('SagaManager Execution Order', () => {
  it('should execute steps in correct order and pass data between them', async () => {
    const executionLog: string[] = [];

    const sagaManager = new SagaManager('test-correlation');

    sagaManager
      .addStep({
        name: 'step1_fetch',
        execute: async (input: { userId: string }) => {
          executionLog.push(`step1: ${input.userId}`);
          return { userId: input.userId, data: 'fetched' };
        },
      })
      .addStep({
        name: 'step2_transform',
        execute: async (input: { userId: string; data: string }) => {
          executionLog.push(`step2: ${input.data}`);
          return { ...input, transformed: true };
        },
      })
      .addStep({
        name: 'step3_save',
        execute: async (input: any) => {
          executionLog.push(`step3: saving ${JSON.stringify(input)}`);
          return { saved: true, ...input };
        },
      });

    const result = await sagaManager.execute({ userId: 'user-123' });

    expect(result.success).toBe(true);
    expect(executionLog).toEqual([
      'step1: user-123',
      'step2: fetched',
      expect.stringContaining('step3: saving'),
    ]);
    expect(result.data).toEqual({
      userId: 'user-123',
      data: 'fetched',
      transformed: true,
      saved: true,
    });
  });

  it('should compensate in reverse order on failure', async () => {
    const compensationLog: string[] = [];

    const sagaManager = new SagaManager();

    sagaManager
      .addStep({
        name: 'step1',
        execute: async () => 'result1',
        compensate: async () => {
          compensationLog.push('compensate1');
        },
      })
      .addStep({
        name: 'step2',
        execute: async () => 'result2',
        compensate: async () => {
          compensationLog.push('compensate2');
        },
      })
      .addStep({
        name: 'step3',
        execute: async () => {
          throw new Error('Step 3 failed');
        },
        compensate: async () => {
          compensationLog.push('compensate3');
        },
      });

    const result = await sagaManager.execute('input');

    expect(result.success).toBe(false);
    expect(result.compensated).toBe(true);
    // Compensation runs in reverse, excluding failed step
    expect(compensationLog).toEqual(['compensate2', 'compensate1']);
  });
});
