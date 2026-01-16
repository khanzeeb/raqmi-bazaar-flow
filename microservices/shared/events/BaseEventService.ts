/**
 * Base Event Service
 * Abstract base class for service-specific event handlers
 */

import { ServiceEventEmitter, createEventEmitter, EventSubscription } from './EventEmitter';
import { EventType, EventPayload } from './types';

export interface EventListenerConfig {
  eventType: EventType;
  handler: (payload: EventPayload) => void | Promise<void>;
}

export abstract class BaseEventService {
  protected eventEmitter: ServiceEventEmitter;
  protected serviceName: string;
  protected subscriptions: EventSubscription[] = [];
  private isInitialized: boolean = false;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.eventEmitter = createEventEmitter(serviceName);
  }

  /**
   * Initialize event listeners - must be called after service setup
   */
  initialize(): void {
    if (this.isInitialized) {
      console.warn(`${this.serviceName} event service already initialized`);
      return;
    }

    const listeners = this.getEventListeners();
    
    for (const listener of listeners) {
      const subscription = this.eventEmitter.onEvent(listener.eventType, listener.handler.bind(this));
      this.subscriptions.push(subscription);
    }

    this.onInitialized();
    this.isInitialized = true;
    
    console.log(`[${this.serviceName}] Event service initialized with ${listeners.length} listeners`);
  }

  /**
   * Cleanup subscriptions
   */
  destroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
    this.subscriptions = [];
    this.isInitialized = false;
    console.log(`[${this.serviceName}] Event service destroyed`);
  }

  /**
   * Get the event emitter instance
   */
  getEventEmitter(): ServiceEventEmitter {
    return this.eventEmitter;
  }

  /**
   * Emit an event
   */
  protected emit<T>(eventType: EventType, data: T, correlationId?: string): void {
    this.eventEmitter.emitEvent(eventType, data, correlationId);
  }

  /**
   * List all active subscriptions
   */
  listSubscriptions(): Array<{ eventType: EventType }> {
    return this.subscriptions.map(s => ({ eventType: s.eventType }));
  }

  /**
   * Abstract: Define event listeners for this service
   */
  protected abstract getEventListeners(): EventListenerConfig[];

  /**
   * Hook called after initialization
   */
  protected onInitialized(): void {
    // Override in subclasses if needed
  }
}
