/**
 * Unit Tests for SaleEventEmitter
 * Tests event emission for sale-related events
 */

import { SaleEventEmitter } from '../sale.events';
import { serviceEventEmitter } from '../EventEmitter';

// Mock the serviceEventEmitter
jest.mock('../EventEmitter', () => ({
  serviceEventEmitter: {
    emitEvent: jest.fn(),
  },
}));

describe('SaleEventEmitter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('emitSaleCreated', () => {
    it('should emit sale.created event with correct payload', () => {
      const payload = {
        sale_id: 'sale-123',
        sale_number: 'SL-2024-001',
        customer_id: 'cust-456',
        total_amount: 1500.00,
        items_count: 3,
        reservation_id: 'res-789',
      };

      SaleEventEmitter.emitSaleCreated(payload);

      expect(serviceEventEmitter.emitEvent).toHaveBeenCalledWith(
        'sale.created',
        payload
      );
    });

    it('should emit without optional reservation_id', () => {
      const payload = {
        sale_id: 'sale-123',
        sale_number: 'SL-2024-002',
        customer_id: 'cust-456',
        total_amount: 500.00,
        items_count: 1,
      };

      SaleEventEmitter.emitSaleCreated(payload);

      expect(serviceEventEmitter.emitEvent).toHaveBeenCalledWith(
        'sale.created',
        payload
      );
    });
  });

  describe('emitSaleCancelled', () => {
    it('should emit sale.cancelled event with correct payload', () => {
      const payload = {
        sale_id: 'sale-123',
        reason: 'Customer requested cancellation',
      };

      SaleEventEmitter.emitSaleCancelled(payload);

      expect(serviceEventEmitter.emitEvent).toHaveBeenCalledWith(
        'sale.cancelled',
        payload
      );
    });
  });

  describe('emitSagaStarted', () => {
    it('should emit sale.saga.started event', () => {
      const payload = {
        action: 'validate_inventory',
        items_count: 5,
      };

      SaleEventEmitter.emitSagaStarted(payload);

      expect(serviceEventEmitter.emitEvent).toHaveBeenCalledWith(
        'sale.saga.started',
        payload
      );
    });
  });

  describe('emitSagaCompleted', () => {
    it('should emit sale.saga.completed event with reservation_id', () => {
      const payload = {
        action: 'validate_inventory',
        reservation_id: 'res-12345',
      };

      SaleEventEmitter.emitSagaCompleted(payload);

      expect(serviceEventEmitter.emitEvent).toHaveBeenCalledWith(
        'sale.saga.completed',
        payload
      );
    });

    it('should emit without reservation_id', () => {
      const payload = {
        action: 'validate_inventory',
      };

      SaleEventEmitter.emitSagaCompleted(payload);

      expect(serviceEventEmitter.emitEvent).toHaveBeenCalledWith(
        'sale.saga.completed',
        payload
      );
    });
  });

  describe('emitSagaFailed', () => {
    it('should emit sale.saga.failed event with errors', () => {
      const payload = {
        action: 'validate_inventory',
        errors: ['Insufficient stock', 'Item not found'],
        compensated: true,
      };

      SaleEventEmitter.emitSagaFailed(payload);

      expect(serviceEventEmitter.emitEvent).toHaveBeenCalledWith(
        'sale.saga.failed',
        payload
      );
    });

    it('should emit with empty errors array', () => {
      const payload = {
        action: 'reserve_inventory',
        errors: [],
        compensated: false,
      };

      SaleEventEmitter.emitSagaFailed(payload);

      expect(serviceEventEmitter.emitEvent).toHaveBeenCalledWith(
        'sale.saga.failed',
        payload
      );
    });
  });
});
