import { EventEmitter } from 'events';

export type EventType = 
  | 'inventory.check.request'
  | 'inventory.check.response'
  | 'inventory.reserve.request'
  | 'inventory.reserve.response'
  | 'inventory.release.request'
  | 'inventory.release.response'
  | 'sale.created'
  | 'sale.cancelled'
  | 'sale.saga.started'
  | 'sale.saga.completed'
  | 'sale.saga.failed';

export interface EventPayload {
  correlationId: string;
  timestamp: Date;
  data: any;
}

export interface InventoryCheckRequest {
  items: Array<{
    product_id: string;
    quantity: number;
    product_name?: string;
  }>;
}

export interface InventoryCheckResponse {
  success: boolean;
  available: boolean;
  items: Array<{
    product_id: string;
    requested_quantity: number;
    available_quantity: number;
    is_available: boolean;
  }>;
  errors?: string[];
}

export interface InventoryReserveRequest {
  sale_id?: string;
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
}

export interface InventoryReserveResponse {
  success: boolean;
  reservation_id?: string;
  items?: Array<{
    product_id: string;
    reserved_quantity: number;
  }>;
  errors?: string[];
}

export interface InventoryReleaseRequest {
  reservation_id: string;
  sale_id?: string;
}

export interface InventoryReleaseResponse {
  success: boolean;
  errors?: string[];
}

class ServiceEventEmitter extends EventEmitter {
  private static instance: ServiceEventEmitter;

  private constructor() {
    super();
    this.setMaxListeners(100);
  }

  static getInstance(): ServiceEventEmitter {
    if (!ServiceEventEmitter.instance) {
      ServiceEventEmitter.instance = new ServiceEventEmitter();
    }
    return ServiceEventEmitter.instance;
  }

  emitEvent<T>(eventType: EventType, payload: T, correlationId?: string): void {
    const eventPayload: EventPayload = {
      correlationId: correlationId || this.generateCorrelationId(),
      timestamp: new Date(),
      data: payload,
    };
    this.emit(eventType, eventPayload);
  }

  onEvent<T>(eventType: EventType, handler: (payload: EventPayload & { data: T }) => void): void {
    this.on(eventType, handler);
  }

  onceEvent<T>(eventType: EventType, handler: (payload: EventPayload & { data: T }) => void): void {
    this.once(eventType, handler);
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const serviceEventEmitter = ServiceEventEmitter.getInstance();
