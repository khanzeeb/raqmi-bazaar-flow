/**
 * Sale Event Handlers
 * Single Responsibility: Emit and handle sale-related events
 */

import { serviceEventEmitter } from './EventEmitter';
import { 
  SaleCreatedPayload, 
  SaleCancelledPayload, 
  SagaStartedPayload,
  SagaCompletedPayload,
  SagaFailedPayload 
} from './types';

export class SaleEventEmitter {
  /**
   * Emit sale created event
   */
  static emitSaleCreated(payload: SaleCreatedPayload): void {
    serviceEventEmitter.emitEvent('sale.created', payload);
  }

  /**
   * Emit sale cancelled event
   */
  static emitSaleCancelled(payload: SaleCancelledPayload): void {
    serviceEventEmitter.emitEvent('sale.cancelled', payload);
  }

  /**
   * Emit saga started event
   */
  static emitSagaStarted(payload: SagaStartedPayload): void {
    serviceEventEmitter.emitEvent('sale.saga.started', payload);
  }

  /**
   * Emit saga completed event
   */
  static emitSagaCompleted(payload: SagaCompletedPayload): void {
    serviceEventEmitter.emitEvent('sale.saga.completed', payload);
  }

  /**
   * Emit saga failed event
   */
  static emitSagaFailed(payload: SagaFailedPayload): void {
    serviceEventEmitter.emitEvent('sale.saga.failed', payload);
  }
}
