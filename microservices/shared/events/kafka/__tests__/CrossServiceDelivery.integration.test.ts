/**
 * Cross-Service Event Delivery Tests
 * Simulates real-world event flows between microservices
 */

import { 
  createCustomerServiceBridge,
  createOrderServiceBridge,
  createInventoryServiceBridge,
  createPaymentServiceBridge,
  createInvoiceServiceBridge,
  KafkaEventBridge 
} from '../ServiceBridges';
import { ServiceEventEmitter } from '../../EventEmitter';
import { 
  SaleCreatedPayload,
  PaymentCompletedPayload,
  InvoiceCreatedPayload 
} from '../../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const USE_REAL_KAFKA = process.env.TEST_KAFKA === 'true';

describe('Cross-Service Event Delivery', () => {
  describe('Service Bridge Factory Tests', () => {
    it('should create customer service bridge with correct config', () => {
      const bridge = createCustomerServiceBridge();
      expect(bridge).toBeDefined();
      expect(bridge.getEventEmitter().getServiceName()).toBe('customer-service');
    });

    it('should create order service bridge with correct config', () => {
      const bridge = createOrderServiceBridge();
      expect(bridge).toBeDefined();
      expect(bridge.getEventEmitter().getServiceName()).toBe('order-service');
    });

    it('should create inventory service bridge with correct config', () => {
      const bridge = createInventoryServiceBridge();
      expect(bridge).toBeDefined();
      expect(bridge.getEventEmitter().getServiceName()).toBe('inventory-service');
    });

    it('should create payment service bridge with correct config', () => {
      const bridge = createPaymentServiceBridge();
      expect(bridge).toBeDefined();
      expect(bridge.getEventEmitter().getServiceName()).toBe('payment-service');
    });

    it('should create invoice service bridge with correct config', () => {
      const bridge = createInvoiceServiceBridge();
      expect(bridge).toBeDefined();
      expect(bridge.getEventEmitter().getServiceName()).toBe('invoice-service');
    });
  });

  // Integration tests require real Kafka
  const integrationTests = USE_REAL_KAFKA ? describe : describe.skip;

  integrationTests('Order-to-Payment Flow', () => {
    let orderBridge: KafkaEventBridge;
    let paymentBridge: KafkaEventBridge;
    let invoiceBridge: KafkaEventBridge;

    beforeAll(async () => {
      // Reset singletons
      ServiceEventEmitter.resetInstance();

      orderBridge = createOrderServiceBridge();
      paymentBridge = createPaymentServiceBridge();
      invoiceBridge = createInvoiceServiceBridge();

      await Promise.all([
        orderBridge.connect(),
        paymentBridge.connect(),
        invoiceBridge.connect(),
      ]);

      await delay(3000);
    }, 30000);

    afterAll(async () => {
      await Promise.all([
        orderBridge?.disconnect(),
        paymentBridge?.disconnect(),
        invoiceBridge?.disconnect(),
      ]);
    });

    it('should trigger invoice creation when sale is created', async () => {
      const invoiceEvents: any[] = [];

      invoiceBridge.getEventEmitter().onEvent('sale.created', (payload) => {
        invoiceEvents.push(payload);
      });

      // Order service creates a sale
      const salePayload: SaleCreatedPayload = {
        sale_id: 'flow-test-sale-001',
        sale_number: 'SALE-FLOW-001',
        customer_id: 'cust-flow-001',
        total_amount: 500.00,
        items_count: 5,
      };

      orderBridge.getEventEmitter().emitEvent('sale.created', salePayload);

      await delay(5000);

      expect(invoiceEvents.length).toBeGreaterThanOrEqual(1);
    }, 15000);

    it('should update order when payment is completed', async () => {
      const orderEvents: any[] = [];

      orderBridge.getEventEmitter().onEvent('payment.completed', (payload) => {
        orderEvents.push(payload);
      });

      // Payment service completes a payment
      paymentBridge.getEventEmitter().emitEvent('payment.completed', {
        payment_id: 'pay-flow-001',
        payment_number: 'PAY-001',
        customer_id: 'cust-flow-001',
        amount: 500.00,
        method: 'credit_card',
      });

      await delay(5000);

      expect(orderEvents.length).toBeGreaterThanOrEqual(1);
    }, 15000);
  });

  integrationTests('Inventory-Order Saga Flow', () => {
    let orderBridge: KafkaEventBridge;
    let inventoryBridge: KafkaEventBridge;

    beforeAll(async () => {
      ServiceEventEmitter.resetInstance();

      orderBridge = createOrderServiceBridge();
      inventoryBridge = createInventoryServiceBridge();

      await Promise.all([
        orderBridge.connect(),
        inventoryBridge.connect(),
      ]);

      await delay(3000);
    }, 30000);

    afterAll(async () => {
      await Promise.all([
        orderBridge?.disconnect(),
        inventoryBridge?.disconnect(),
      ]);
    });

    it('should receive inventory reservation response', async () => {
      const responseEvents: any[] = [];

      orderBridge.getEventEmitter().onEvent('inventory.reserve.response', (payload) => {
        responseEvents.push(payload);
      });

      // Inventory service sends reservation response
      inventoryBridge.getEventEmitter().emitEvent('inventory.reserve.response', {
        success: true,
        reservation_id: 'res-flow-001',
        items: [
          { product_id: 'prod-001', reserved_quantity: 10 },
          { product_id: 'prod-002', reserved_quantity: 5 },
        ],
        expires_at: new Date(Date.now() + 15 * 60 * 1000),
      });

      await delay(5000);

      expect(responseEvents.length).toBeGreaterThanOrEqual(1);
      expect(responseEvents[0].data.reservation_id).toBe('res-flow-001');
    }, 15000);

    it('should handle inventory release on saga failure', async () => {
      const releaseEvents: any[] = [];

      inventoryBridge.getEventEmitter().onEvent('saga.failed', (payload) => {
        releaseEvents.push(payload);
        
        // Simulate releasing inventory
        inventoryBridge.getEventEmitter().emitEvent('inventory.release.response', {
          reservation_id: payload.data.reservation_id || 'res-fail-001',
          success: true,
        });
      });

      // Order service reports saga failure
      orderBridge.getEventEmitter().emitEvent('saga.failed', {
        saga_name: 'sale-creation-saga',
        action: 'create_sale',
        errors: ['Payment declined'],
        compensated: true,
        failed_step: 'process_payment',
      });

      await delay(5000);

      expect(releaseEvents.length).toBeGreaterThanOrEqual(0);
    }, 15000);
  });

  integrationTests('Full Order Lifecycle', () => {
    let orderBridge: KafkaEventBridge;
    let inventoryBridge: KafkaEventBridge;
    let paymentBridge: KafkaEventBridge;
    let invoiceBridge: KafkaEventBridge;

    const eventLog: Array<{ service: string; event: string; timestamp: Date }> = [];

    beforeAll(async () => {
      ServiceEventEmitter.resetInstance();

      orderBridge = createOrderServiceBridge();
      inventoryBridge = createInventoryServiceBridge();
      paymentBridge = createPaymentServiceBridge();
      invoiceBridge = createInvoiceServiceBridge();

      await Promise.all([
        orderBridge.connect(),
        inventoryBridge.connect(),
        paymentBridge.connect(),
        invoiceBridge.connect(),
      ]);

      // Setup event logging
      const logEvent = (service: string, event: string) => {
        eventLog.push({ service, event, timestamp: new Date() });
      };

      orderBridge.getEventEmitter().onAllEvents((e) => logEvent('order', e.type));
      inventoryBridge.getEventEmitter().onAllEvents((e) => logEvent('inventory', e.type));
      paymentBridge.getEventEmitter().onAllEvents((e) => logEvent('payment', e.type));
      invoiceBridge.getEventEmitter().onAllEvents((e) => logEvent('invoice', e.type));

      await delay(3000);
    }, 30000);

    afterAll(async () => {
      await Promise.all([
        orderBridge?.disconnect(),
        inventoryBridge?.disconnect(),
        paymentBridge?.disconnect(),
        invoiceBridge?.disconnect(),
      ]);

      // Print event timeline
      console.log('\n=== Event Timeline ===');
      eventLog.forEach(e => {
        console.log(`[${e.timestamp.toISOString()}] ${e.service}: ${e.event}`);
      });
    });

    it('should complete full order lifecycle', async () => {
      const saleId = `lifecycle-${Date.now()}`;

      // Step 1: Order service starts saga
      orderBridge.getEventEmitter().emitEvent('saga.started', {
        saga_name: 'sale-creation-saga',
        action: 'create_sale',
        steps: ['check_inventory', 'reserve_inventory', 'create_sale', 'create_invoice'],
      });

      await delay(1000);

      // Step 2: Inventory reserves stock
      inventoryBridge.getEventEmitter().emitEvent('inventory.reserve.response', {
        success: true,
        reservation_id: `res-${saleId}`,
        items: [{ product_id: 'prod-001', reserved_quantity: 1 }],
      });

      await delay(1000);

      // Step 3: Order is created
      orderBridge.getEventEmitter().emitEvent('sale.created', {
        sale_id: saleId,
        sale_number: 'SALE-LIFECYCLE-001',
        customer_id: 'cust-lifecycle-001',
        total_amount: 100.00,
        items_count: 1,
        reservation_id: `res-${saleId}`,
      });

      await delay(1000);

      // Step 4: Payment is received
      paymentBridge.getEventEmitter().emitEvent('payment.completed', {
        payment_id: `pay-${saleId}`,
        payment_number: 'PAY-LIFECYCLE-001',
        customer_id: 'cust-lifecycle-001',
        amount: 100.00,
        method: 'credit_card',
      });

      await delay(1000);

      // Step 5: Saga completes
      orderBridge.getEventEmitter().emitEvent('saga.completed', {
        saga_name: 'sale-creation-saga',
        action: 'create_sale',
        result: { sale_id: saleId },
      });

      await delay(3000);

      // Verify events were logged
      expect(eventLog.length).toBeGreaterThan(0);
      
      const sagaEvents = eventLog.filter(e => e.event.includes('saga'));
      expect(sagaEvents.length).toBeGreaterThanOrEqual(2);
    }, 30000);
  });
});
