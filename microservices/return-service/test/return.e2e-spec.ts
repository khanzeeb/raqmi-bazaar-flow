import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { randomUUID } from 'crypto';

import { ReturnModule } from '../src/modules/return/return.module';
import { ReturnRepository } from '../src/modules/return/return.repository';
import { ReturnEventHandler } from '../src/modules/return/events/return-event.handler';
import { KNEX_TOKEN } from '../src/database/knex.module';
import { InMemoryReturnRepository } from './in-memory-return.repository';

/**
 * Full end-to-end workflow tests for the return-service.
 *
 *   create → approve → process            (happy path)
 *   create → reject                       (rejection path)
 *   invalid status transitions            (guards)
 *   over-return validation                (business rules)
 *   inventory-related event handling      (restock side-effects)
 */
describe('Return workflow (e2e)', () => {
  let app: INestApplication;
  let repo: InMemoryReturnRepository;

  const sampleItem = (overrides: Partial<any> = {}) => ({
    saleItemId: randomUUID(),
    productId: randomUUID(),
    productName: 'Widget',
    productSku: 'SKU-001',
    quantityReturned: 2,
    originalQuantity: 5,
    unitPrice: 10,
    condition: 'good',
    ...overrides,
  });

  const samplePayload = (overrides: Partial<any> = {}) => ({
    saleId: randomUUID(),
    customerId: randomUUID(),
    returnDate: new Date().toISOString(),
    returnType: 'partial',
    reason: 'defective',
    items: [sampleItem()],
    ...overrides,
  });

  beforeAll(async () => {
    repo = new InMemoryReturnRepository();

    const moduleRef = await Test.createTestingModule({
      imports: [ReturnModule],
    })
      .overrideProvider(KNEX_TOKEN)
      .useValue({}) // KnexModule provider stub — repo is overridden below
      .overrideProvider(ReturnRepository)
      .useValue(repo)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    repo.returns.clear();
    repo.items.clear();
  });

  // ───────────────────────── Happy path ─────────────────────────

  describe('create → approve → process', () => {
    it('walks a return through every state transition', async () => {
      // 1. CREATE
      const payload = samplePayload();
      const createRes = await request(app.getHttpServer())
        .post('/api/returns')
        .send(payload)
        .expect(201);

      expect(createRes.body).toMatchObject({
        sale_id: payload.saleId,
        customer_id: payload.customerId,
        status: 'pending',
        refund_status: 'pending',
        return_type: 'partial',
        total_amount: 20, // 2 * 10
      });
      expect(createRes.body.return_number).toMatch(/^RET-\d{6}-\d{4}$/);
      expect(createRes.body.items).toHaveLength(1);
      const id = createRes.body.id;

      // 2. GET BY ID — items included
      const getRes = await request(app.getHttpServer())
        .get(`/api/returns/${id}`)
        .expect(200);
      expect(getRes.body.id).toBe(id);
      expect(getRes.body.items).toHaveLength(1);

      // 3. APPROVE
      const processedBy = randomUUID();
      const approveRes = await request(app.getHttpServer())
        .post(`/api/returns/${id}/approve`)
        .send({ processedBy })
        .expect(201);
      expect(approveRes.body.status).toBe('approved');
      expect(approveRes.body.processed_by).toBe(processedBy);
      expect(approveRes.body.processed_at).toBeDefined();

      // 4. PROCESS (refund)
      const processRes = await request(app.getHttpServer())
        .post(`/api/returns/${id}/process`)
        .send({ refundAmount: 15 })
        .expect(201);
      expect(processRes.body).toMatchObject({
        status: 'completed',
        refund_status: 'processed',
        refund_amount: 15,
      });
    });
  });

  // ───────────────────────── Rejection path ─────────────────────────

  describe('create → reject', () => {
    it('rejects a pending return and stores the rejection reason', async () => {
      const create = await request(app.getHttpServer())
        .post('/api/returns')
        .send(samplePayload())
        .expect(201);

      const rejectRes = await request(app.getHttpServer())
        .post(`/api/returns/${create.body.id}/reject`)
        .send({ reason: 'Customer changed mind', processedBy: randomUUID() })
        .expect(201);

      expect(rejectRes.body).toMatchObject({
        status: 'rejected',
        notes: 'Customer changed mind',
      });
      expect(rejectRes.body.processed_at).toBeDefined();
    });
  });

  // ───────────────────────── Invalid transitions ─────────────────────────

  describe('status transition guards', () => {
    const createReturn = async () =>
      (await request(app.getHttpServer())
        .post('/api/returns')
        .send(samplePayload())
        .expect(201)).body;

    it('cannot process a return that has not been approved', async () => {
      const r = await createReturn();
      await request(app.getHttpServer())
        .post(`/api/returns/${r.id}/process`)
        .send({})
        .expect(409);
    });

    it('cannot approve a return twice', async () => {
      const r = await createReturn();
      await request(app.getHttpServer()).post(`/api/returns/${r.id}/approve`).send({}).expect(201);
      await request(app.getHttpServer()).post(`/api/returns/${r.id}/approve`).send({}).expect(409);
    });

    it('cannot reject an already-approved return', async () => {
      const r = await createReturn();
      await request(app.getHttpServer()).post(`/api/returns/${r.id}/approve`).send({}).expect(201);
      await request(app.getHttpServer())
        .post(`/api/returns/${r.id}/reject`)
        .send({ reason: 'late' })
        .expect(409);
    });

    it('cannot delete a non-pending return', async () => {
      const r = await createReturn();
      await request(app.getHttpServer()).post(`/api/returns/${r.id}/approve`).send({}).expect(201);
      await request(app.getHttpServer()).delete(`/api/returns/${r.id}`).expect(409);
    });

    it('cannot update a completed return', async () => {
      const r = await createReturn();
      await request(app.getHttpServer()).post(`/api/returns/${r.id}/approve`).send({}).expect(201);
      await request(app.getHttpServer())
        .post(`/api/returns/${r.id}/process`)
        .send({ refundAmount: 20 })
        .expect(201);
      await request(app.getHttpServer())
        .put(`/api/returns/${r.id}`)
        .send({ notes: 'edit attempt' })
        .expect(409);
    });

    it('rejects a process refund amount greater than the total', async () => {
      const r = await createReturn();
      await request(app.getHttpServer()).post(`/api/returns/${r.id}/approve`).send({}).expect(201);
      await request(app.getHttpServer())
        .post(`/api/returns/${r.id}/process`)
        .send({ refundAmount: 9999 })
        .expect(400);
    });

    it('returns 404 for unknown id workflow actions', async () => {
      const missing = randomUUID();
      await request(app.getHttpServer()).get(`/api/returns/${missing}`).expect(404);
      await request(app.getHttpServer()).post(`/api/returns/${missing}/approve`).send({}).expect(404);
      await request(app.getHttpServer()).post(`/api/returns/${missing}/reject`).send({}).expect(404);
      await request(app.getHttpServer()).post(`/api/returns/${missing}/process`).send({}).expect(404);
    });
  });

  // ───────────────────────── Business rules ─────────────────────────

  describe('over-return validation', () => {
    it('rejects when quantityReturned > originalQuantity on a single line', async () => {
      await request(app.getHttpServer())
        .post('/api/returns')
        .send(samplePayload({ items: [sampleItem({ quantityReturned: 99, originalQuantity: 5 })] }))
        .expect(400);
    });

    it('rejects when cumulative returned qty across requests exceeds original', async () => {
      const saleItemId = randomUUID();
      // First return: 4 / 5 — accepted
      await request(app.getHttpServer())
        .post('/api/returns')
        .send(samplePayload({ items: [sampleItem({ saleItemId, quantityReturned: 4, originalQuantity: 5 })] }))
        .expect(201);
      // Second return: 2 more for same sale item — total would be 6 > 5
      await request(app.getHttpServer())
        .post('/api/returns')
        .send(samplePayload({ items: [sampleItem({ saleItemId, quantityReturned: 2, originalQuantity: 5 })] }))
        .expect(400);
    });
  });

  // ───────────────────────── Stats & queries ─────────────────────────

  describe('stats and lookups', () => {
    it('aggregates counts after a full workflow', async () => {
      const r1 = (await request(app.getHttpServer()).post('/api/returns').send(samplePayload()).expect(201)).body;
      await request(app.getHttpServer()).post(`/api/returns/${r1.id}/approve`).send({}).expect(201);
      await request(app.getHttpServer()).post(`/api/returns/${r1.id}/process`).send({}).expect(201);

      const r2 = (await request(app.getHttpServer()).post('/api/returns').send(samplePayload()).expect(201)).body;
      await request(app.getHttpServer())
        .post(`/api/returns/${r2.id}/reject`)
        .send({ reason: 'invalid' })
        .expect(201);

      const stats = (await request(app.getHttpServer()).get('/api/returns/stats').expect(200)).body;
      expect(stats.totalReturns).toBe(2);
      expect(stats.completedCount).toBe(1);
      expect(stats.rejectedCount).toBe(1);
    });

    it('lists by sale id and customer id', async () => {
      const payload = samplePayload();
      await request(app.getHttpServer()).post('/api/returns').send(payload).expect(201);

      const bySale = await request(app.getHttpServer())
        .get(`/api/returns/sale/${payload.saleId}`)
        .expect(200);
      expect(bySale.body).toHaveLength(1);

      const byCustomer = await request(app.getHttpServer())
        .get(`/api/returns/customer/${payload.customerId}`)
        .expect(200);
      expect(byCustomer.body).toHaveLength(1);
    });
  });

  // ───────────────────────── Inventory effects ─────────────────────────

  describe('inventory side-effects', () => {
    it('event handler reacts to inventory.restock_failed for a completed return', async () => {
      const handler = app.get(ReturnEventHandler);
      const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

      // Run full workflow to completion
      const created = (
        await request(app.getHttpServer()).post('/api/returns').send(samplePayload()).expect(201)
      ).body;
      await request(app.getHttpServer()).post(`/api/returns/${created.id}/approve`).send({}).expect(201);
      await request(app.getHttpServer()).post(`/api/returns/${created.id}/process`).send({}).expect(201);

      // Simulate an inventory restock failure event for this return
      await handler.onRestockFailed({ return_id: created.id });
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining(`inventory.restock_failed: ${created.id}`),
      );

      // Simulate a refund event triggered by payment service
      await handler.onPaymentRefunded({ payment_id: 'pay-1', return_id: created.id });
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('payment.refunded: pay-1'));

      // Sale cancellation should also be observable
      await handler.onSaleCancelled({ sale_id: 'sale-x' });
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('sale.cancelled: sale-x'));

      spy.mockRestore();
    });
  });
});
