/**
 * Test Utilities and Factories for Order Service Tests
 */

import { CreateSaleDTO, UpdateSaleDTO, SaleItemDTO, SalePaymentDTO } from '../../dto';
import { Sale } from '../../models/Sale';

/**
 * Factory for creating test sale DTOs
 */
export const SaleFactory = {
  createDTO: (overrides: Partial<CreateSaleDTO> = {}): CreateSaleDTO => ({
    customer_id: `cust-${Date.now()}`,
    sale_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subtotal: 1000,
    tax_amount: 100,
    discount_amount: 0,
    total_amount: 1100,
    currency: 'USD',
    notes: 'Test sale',
    ...overrides,
  }),

  updateDTO: (overrides: Partial<UpdateSaleDTO> = {}): UpdateSaleDTO => ({
    ...overrides,
  }),

  entity: (overrides: Partial<Sale> = {}): Sale => ({
    id: `sale-${Date.now()}`,
    sale_number: `SAL-${Date.now()}`,
    customer_id: 'cust-001',
    sale_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subtotal: 1000,
    tax_amount: 100,
    discount_amount: 0,
    total_amount: 1100,
    paid_amount: 0,
    balance_amount: 1100,
    status: 'draft',
    payment_status: 'unpaid',
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }),
};

/**
 * Factory for creating test sale item DTOs
 */
export const SaleItemFactory = {
  create: (overrides: Partial<SaleItemDTO> = {}): SaleItemDTO => ({
    product_id: `prod-${Date.now()}`,
    product_name: 'Test Product',
    product_sku: `SKU-${Date.now()}`,
    quantity: 1,
    unit_price: 100,
    discount_amount: 0,
    tax_amount: 10,
    ...overrides,
  }),

  createMany: (count: number, baseOverrides: Partial<SaleItemDTO> = {}): SaleItemDTO[] =>
    Array.from({ length: count }, (_, index) =>
      SaleItemFactory.create({
        product_id: `prod-${index + 1}`,
        product_name: `Product ${index + 1}`,
        product_sku: `SKU-${index + 1}`,
        ...baseOverrides,
      })
    ),
};

/**
 * Factory for creating payment DTOs
 */
export const PaymentFactory = {
  create: (overrides: Partial<SalePaymentDTO> = {}): SalePaymentDTO => ({
    amount: 100,
    payment_method_code: 'CASH',
    payment_date: new Date().toISOString().split('T')[0],
    reference: `REF-${Date.now()}`,
    notes: 'Test payment',
    ...overrides,
  }),
};

/**
 * Mock factory for inventory validation results
 */
export const InventoryMockFactory = {
  successfulValidation: (items: SaleItemDTO[], reservationId?: string) => ({
    success: true,
    data: {
      success: true,
      reservation_id: reservationId || `res-${Date.now()}`,
      items: items.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    },
  }),

  failedValidation: (unavailableItems: Array<{
    product_id: string;
    requested_quantity: number;
    available_quantity: number;
  }>) => ({
    success: false,
    errors: ['Insufficient stock'],
    compensated: true,
    data: {
      success: false,
      items: [],
      unavailable_items: unavailableItems.map(item => ({
        product_id: item.product_id,
        product_name: `Product ${item.product_id}`,
        requested_quantity: item.requested_quantity,
        available_quantity: item.available_quantity,
      })),
    },
  }),

  checkOnlySuccess: (items: SaleItemDTO[]) => ({
    success: true,
    available: true,
    items: items.map(item => ({
      product_id: item.product_id,
      requested_quantity: item.quantity,
      available_quantity: 1000,
      is_available: true,
    })),
  }),

  checkOnlyPartialAvailable: (items: SaleItemDTO[], unavailableIds: string[]) => ({
    success: true,
    available: false,
    items: items.map(item => ({
      product_id: item.product_id,
      requested_quantity: item.quantity,
      available_quantity: unavailableIds.includes(item.product_id) ? 0 : 1000,
      is_available: !unavailableIds.includes(item.product_id),
    })),
  }),
};

/**
 * Mock repository factory
 */
export const MockRepositoryFactory = {
  sale: () => ({
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    generateSaleNumber: jest.fn(),
    getOverdueSales: jest.fn(),
    getSaleStats: jest.fn(),
    updatePaymentAmounts: jest.fn(),
    findBySaleNumber: jest.fn(),
  }),

  saleItem: () => ({
    createBulk: jest.fn(),
    findBySaleId: jest.fn(),
    delete: jest.fn(),
  }),

  paymentAllocation: () => ({
    create: jest.fn(),
    findBySaleId: jest.fn(),
    findByPaymentId: jest.fn(),
  }),
};

/**
 * Test assertion helpers
 */
export const TestAssertions = {
  expectSaleCreatedEventPayload: (
    mockEmitter: jest.Mock,
    expected: {
      sale_id?: string;
      customer_id?: string;
      items_count?: number;
    }
  ) => {
    expect(mockEmitter).toHaveBeenCalledWith(
      expect.objectContaining(expected)
    );
  },

  expectInventoryValidationError: async (
    promise: Promise<any>,
    expectedUnavailableCount: number
  ) => {
    try {
      await promise;
      fail('Expected InventoryValidationError to be thrown');
    } catch (error: any) {
      expect(error.name).toBe('InventoryValidationError');
      expect(error.unavailable_items?.length).toBe(expectedUnavailableCount);
    }
  },
};

/**
 * Async test utilities
 */
export const TestUtils = {
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  waitForEvent: (emitter: any, eventName: string, timeout: number = 5000) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Timeout waiting for ${eventName}`)), timeout);
      emitter.once(eventName, (data: any) => {
        clearTimeout(timer);
        resolve(data);
      });
    }),
};
