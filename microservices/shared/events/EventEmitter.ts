/**
 * Service Event Emitter
 * Singleton event emitter for service-internal event handling
 */

import { EventEmitter } from 'events';
import { EventType, EventPayload, BaseEventPayload } from './types';

export interface EventHandler<T> {
  (payload: EventPayload<T>): void | Promise<void>;
}

export interface EventSubscription {
  eventType: EventType;
  handler: EventHandler<any>;
  unsubscribe: () => void;
}

export class ServiceEventEmitter extends EventEmitter {
  private static instance: ServiceEventEmitter;
  private serviceName: string;
  private subscriptions: Map<string, EventSubscription[]>;
  private eventHistory: Array<{ type: EventType; payload: EventPayload; timestamp: Date }>;
  private maxHistorySize: number;

  private constructor(serviceName: string = 'unknown-service') {
    super();
    this.serviceName = serviceName;
    this.subscriptions = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 1000;
    this.setMaxListeners(100);
  }

  static getInstance(serviceName?: string): ServiceEventEmitter {
    if (!ServiceEventEmitter.instance) {
      ServiceEventEmitter.instance = new ServiceEventEmitter(serviceName);
    }
    return ServiceEventEmitter.instance;
  }

  static resetInstance(): void {
    ServiceEventEmitter.instance = undefined as any;
  }

  setServiceName(name: string): void {
    this.serviceName = name;
  }

  getServiceName(): string {
    return this.serviceName;
  }

  /**
   * Emit an event with typed payload
   */
  emitEvent<T>(eventType: EventType, data: T, correlationId?: string): void {
    const payload: EventPayload<T> = {
      correlationId: correlationId || this.generateCorrelationId(),
      timestamp: new Date(),
      source: this.serviceName,
      data,
    };

    // Store in history
    this.eventHistory.push({ type: eventType, payload, timestamp: new Date() });
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Emit the event
    this.emit(eventType, payload);
    
    // Also emit a wildcard event for global listeners
    this.emit('*', { type: eventType, ...payload });
  }

  /**
   * Subscribe to an event type
   */
  onEvent<T>(eventType: EventType, handler: EventHandler<T>): EventSubscription {
    this.on(eventType, handler);

    const subscription: EventSubscription = {
      eventType,
      handler,
      unsubscribe: () => {
        this.off(eventType, handler);
        this.removeSubscription(eventType, subscription);
      },
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }
    this.subscriptions.get(eventType)!.push(subscription);

    return subscription;
  }

  /**
   * Subscribe to an event type once
   */
  onceEvent<T>(eventType: EventType, handler: EventHandler<T>): void {
    this.once(eventType, handler);
  }

  /**
   * Wait for an event with timeout
   */
  waitForEvent<T>(eventType: EventType, timeoutMs: number = 30000): Promise<EventPayload<T>> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.off(eventType, handler);
        reject(new Error(`Timeout waiting for event: ${eventType}`));
      }, timeoutMs);

      const handler = (payload: EventPayload<T>) => {
        clearTimeout(timeout);
        resolve(payload);
      };

      this.once(eventType, handler);
    });
  }

  /**
   * Subscribe to all events
   */
  onAllEvents(handler: (event: { type: EventType } & EventPayload) => void): EventSubscription {
    this.on('*', handler);

    const subscription: EventSubscription = {
      eventType: '*' as EventType,
      handler,
      unsubscribe: () => {
        this.off('*', handler);
      },
    };

    return subscription;
  }

  /**
   * Get all subscriptions for an event type
   */
  getSubscriptions(eventType?: EventType): EventSubscription[] {
    if (eventType) {
      return this.subscriptions.get(eventType) || [];
    }
    return Array.from(this.subscriptions.values()).flat();
  }

  /**
   * Get event history
   */
  getEventHistory(eventType?: EventType, limit: number = 100): Array<{ type: EventType; payload: EventPayload; timestamp: Date }> {
    let history = this.eventHistory;
    if (eventType) {
      history = history.filter(e => e.type === eventType);
    }
    return history.slice(-limit);
  }

  /**
   * Clear event history
   */
  clearEventHistory(): void {
    this.eventHistory = [];
  }

  /**
   * List all registered event types
   */
  listEventTypes(): EventType[] {
    return Array.from(this.subscriptions.keys()) as EventType[];
  }

  private removeSubscription(eventType: EventType, subscription: EventSubscription): void {
    const subs = this.subscriptions.get(eventType);
    if (subs) {
      const index = subs.indexOf(subscription);
      if (index > -1) {
        subs.splice(index, 1);
      }
    }
  }

  private generateCorrelationId(): string {
    return `${this.serviceName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Factory function to create or get the singleton instance
export function createEventEmitter(serviceName?: string): ServiceEventEmitter {
  return ServiceEventEmitter.getInstance(serviceName);
}
