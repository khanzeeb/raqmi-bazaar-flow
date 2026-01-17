import { BaseEventService, EventListenerConfig } from '../../shared/events/BaseEventService';
import { EventPayload, SaleCreatedPayload, PaymentCreatedPayload, InventoryCheckResponse } from '../../shared/events/types';
import NotificationService from '../services/NotificationService';

// Notification-specific event types
export type NotificationEventType =
  | 'notification.created'
  | 'notification.read'
  | 'notification.deleted'
  | 'notification.bulk.created';

// Notification event payloads
export interface NotificationCreatedPayload {
  notification_id: string;
  user_id: string;
  type: string;
  category: string;
  title: string;
  priority: string;
}

export interface NotificationReadPayload {
  notification_id: string;
  user_id: string;
}

export class NotificationEventService extends BaseEventService {
  constructor() {
    super('notification-service');
  }

  protected getEventListeners(): EventListenerConfig[] {
    return [
      // Listen for sale events
      { eventType: 'sale.created', handler: this.handleSaleCreated },
      { eventType: 'sale.completed', handler: this.handleSaleCompleted },
      { eventType: 'sale.cancelled', handler: this.handleSaleCancelled },
      
      // Listen for payment events
      { eventType: 'payment.completed', handler: this.handlePaymentCompleted },
      { eventType: 'payment.refunded', handler: this.handlePaymentRefunded },
      
      // Listen for inventory events
      { eventType: 'product.low_stock', handler: this.handleLowStock },
      
      // Listen for customer events
      { eventType: 'customer.created', handler: this.handleCustomerCreated },
      { eventType: 'customer.blocked', handler: this.handleCustomerBlocked },
      
      // Listen for invoice events
      { eventType: 'invoice.overdue', handler: this.handleInvoiceOverdue },
    ];
  }

  // ============= Event Emitters =============

  emitNotificationCreated(payload: NotificationCreatedPayload): void {
    this.emit('notification.created', payload);
  }

  emitNotificationRead(payload: NotificationReadPayload): void {
    this.emit('notification.read', payload);
  }

  emitNotificationDeleted(payload: { notification_id: string }): void {
    this.emit('notification.deleted', payload);
  }

  // ============= Event Handlers =============

  private async handleSaleCreated(payload: EventPayload<SaleCreatedPayload>): Promise<void> {
    console.log(`[notification-service] Processing sale.created for sale ${payload.data.sale_id}`);
    
    // Create notification for relevant users (e.g., admins, managers)
    // In production, you'd fetch the relevant user IDs from the organization
    try {
      await NotificationService.create({
        user_id: 'admin', // This would be dynamic in production
        type: 'info',
        category: 'order',
        title: 'New Sale Created',
        message: `Sale #${payload.data.sale_number} has been created for ${payload.data.total_amount}`,
        data: { sale_id: payload.data.sale_id, sale_number: payload.data.sale_number },
        link: `/sales/${payload.data.sale_id}`,
        priority: 'medium',
      });
    } catch (error) {
      console.error('[notification-service] Failed to create sale notification:', error);
    }
  }

  private async handleSaleCompleted(payload: EventPayload<SaleCreatedPayload>): Promise<void> {
    console.log(`[notification-service] Processing sale.completed for sale ${payload.data.sale_id}`);
    
    try {
      await NotificationService.create({
        user_id: 'admin',
        type: 'success',
        category: 'order',
        title: 'Sale Completed',
        message: `Sale #${payload.data.sale_number} has been completed successfully`,
        data: { sale_id: payload.data.sale_id },
        link: `/sales/${payload.data.sale_id}`,
        priority: 'low',
      });
    } catch (error) {
      console.error('[notification-service] Failed to create sale completed notification:', error);
    }
  }

  private async handleSaleCancelled(payload: EventPayload<{ sale_id: string; reason: string }>): Promise<void> {
    console.log(`[notification-service] Processing sale.cancelled for sale ${payload.data.sale_id}`);
    
    try {
      await NotificationService.create({
        user_id: 'admin',
        type: 'warning',
        category: 'order',
        title: 'Sale Cancelled',
        message: `Sale has been cancelled. Reason: ${payload.data.reason}`,
        data: { sale_id: payload.data.sale_id },
        link: `/sales/${payload.data.sale_id}`,
        priority: 'medium',
      });
    } catch (error) {
      console.error('[notification-service] Failed to create sale cancelled notification:', error);
    }
  }

  private async handlePaymentCompleted(payload: EventPayload<PaymentCreatedPayload>): Promise<void> {
    console.log(`[notification-service] Processing payment.completed for payment ${payload.data.payment_id}`);
    
    try {
      await NotificationService.create({
        user_id: 'admin',
        type: 'success',
        category: 'payment',
        title: 'Payment Received',
        message: `Payment #${payload.data.payment_number} of ${payload.data.amount} received via ${payload.data.method}`,
        data: { payment_id: payload.data.payment_id },
        link: `/payments/${payload.data.payment_id}`,
        priority: 'medium',
      });
    } catch (error) {
      console.error('[notification-service] Failed to create payment notification:', error);
    }
  }

  private async handlePaymentRefunded(payload: EventPayload<{ payment_id: string; amount: number }>): Promise<void> {
    console.log(`[notification-service] Processing payment.refunded for payment ${payload.data.payment_id}`);
    
    try {
      await NotificationService.create({
        user_id: 'admin',
        type: 'warning',
        category: 'payment',
        title: 'Payment Refunded',
        message: `Payment refund of ${payload.data.amount} has been processed`,
        data: { payment_id: payload.data.payment_id },
        link: `/payments/${payload.data.payment_id}`,
        priority: 'high',
      });
    } catch (error) {
      console.error('[notification-service] Failed to create refund notification:', error);
    }
  }

  private async handleLowStock(payload: EventPayload<{ product_id: string; product_name: string; current_stock: number; min_stock: number }>): Promise<void> {
    console.log(`[notification-service] Processing product.low_stock for product ${payload.data.product_id}`);
    
    try {
      await NotificationService.create({
        user_id: 'admin',
        type: 'warning',
        category: 'inventory',
        title: 'Low Stock Alert',
        message: `${payload.data.product_name} is running low (${payload.data.current_stock} remaining, minimum: ${payload.data.min_stock})`,
        data: { product_id: payload.data.product_id },
        link: `/products/${payload.data.product_id}`,
        priority: 'high',
      });
    } catch (error) {
      console.error('[notification-service] Failed to create low stock notification:', error);
    }
  }

  private async handleCustomerCreated(payload: EventPayload<{ customer_id: string; name: string }>): Promise<void> {
    console.log(`[notification-service] Processing customer.created for customer ${payload.data.customer_id}`);
    
    try {
      await NotificationService.create({
        user_id: 'admin',
        type: 'info',
        category: 'customer',
        title: 'New Customer Registered',
        message: `${payload.data.name} has been added as a new customer`,
        data: { customer_id: payload.data.customer_id },
        link: `/customers/${payload.data.customer_id}`,
        priority: 'low',
      });
    } catch (error) {
      console.error('[notification-service] Failed to create customer notification:', error);
    }
  }

  private async handleCustomerBlocked(payload: EventPayload<{ customer_id: string; reason: string }>): Promise<void> {
    console.log(`[notification-service] Processing customer.blocked for customer ${payload.data.customer_id}`);
    
    try {
      await NotificationService.create({
        user_id: 'admin',
        type: 'error',
        category: 'customer',
        title: 'Customer Blocked',
        message: `Customer has been blocked. Reason: ${payload.data.reason}`,
        data: { customer_id: payload.data.customer_id },
        link: `/customers/${payload.data.customer_id}`,
        priority: 'high',
      });
    } catch (error) {
      console.error('[notification-service] Failed to create customer blocked notification:', error);
    }
  }

  private async handleInvoiceOverdue(payload: EventPayload<{ invoice_id: string; customer_id: string; amount: number; days_overdue: number }>): Promise<void> {
    console.log(`[notification-service] Processing invoice.overdue for invoice ${payload.data.invoice_id}`);
    
    try {
      await NotificationService.create({
        user_id: 'admin',
        type: 'error',
        category: 'alert',
        title: 'Invoice Overdue',
        message: `Invoice is ${payload.data.days_overdue} days overdue (${payload.data.amount} outstanding)`,
        data: { invoice_id: payload.data.invoice_id, customer_id: payload.data.customer_id },
        link: `/invoices/${payload.data.invoice_id}`,
        priority: 'urgent',
      });
    } catch (error) {
      console.error('[notification-service] Failed to create overdue invoice notification:', error);
    }
  }
}

export const notificationEventService = new NotificationEventService();
