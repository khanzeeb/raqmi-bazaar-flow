import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ReturnController } from '../return.controller';
import { ReturnService } from '../return.service';
import { ReturnType, ReturnReason, ItemCondition } from '../dto';

const validUuid = '11111111-1111-1111-1111-111111111111';

const validBody = {
  saleId: validUuid,
  customerId: validUuid,
  returnDate: '2026-05-22',
  returnType: ReturnType.PARTIAL,
  reason: ReturnReason.DEFECTIVE,
  items: [{
    saleItemId: validUuid,
    productId: validUuid,
    productName: 'Widget',
    quantityReturned: 2,
    originalQuantity: 5,
    unitPrice: 10,
    condition: ItemCondition.GOOD,
  }],
};

describe('ReturnController (e2e)', () => {
  let app: INestApplication;
  const svc = {
    getAll: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
    getStats: jest.fn().mockResolvedValue({ totalReturns: 0 }),
    getBySaleId: jest.fn().mockResolvedValue([]),
    getByCustomerId: jest.fn().mockResolvedValue([]),
    getById: jest.fn().mockResolvedValue({ id: 'r1', items: [] }),
    create: jest.fn().mockResolvedValue({ id: 'r1' }),
    update: jest.fn().mockResolvedValue({ id: 'r1' }),
    remove: jest.fn().mockResolvedValue(true),
    approve: jest.fn().mockResolvedValue({ id: 'r1', status: 'approved' }),
    reject: jest.fn().mockResolvedValue({ id: 'r1', status: 'rejected' }),
    process: jest.fn().mockResolvedValue({ id: 'r1', status: 'completed' }),
  };

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      controllers: [ReturnController],
      providers: [{ provide: ReturnService, useValue: svc }],
    }).compile();
    app = mod.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }));
    await app.init();
  });

  afterAll(async () => app.close());
  beforeEach(() => jest.clearAllMocks());

  describe('GET /returns', () => {
    it('200 with list', async () => {
      const res = await request(app.getHttpServer()).get('/returns').expect(200);
      expect(res.body.data).toEqual([]);
      expect(svc.getAll).toHaveBeenCalled();
    });
    it('passes filters', async () => {
      await request(app.getHttpServer()).get('/returns?status=pending&page=2&limit=5').expect(200);
      expect(svc.getAll).toHaveBeenCalledWith(expect.objectContaining({ status: 'pending', page: 2, limit: 5 }));
    });
    it('400 invalid enum', async () => {
      await request(app.getHttpServer()).get('/returns?status=bogus').expect(400);
    });
  });

  describe('GET /returns/stats', () => {
    it('200', async () => {
      await request(app.getHttpServer()).get('/returns/stats?dateFrom=2026-01-01&dateTo=2026-12-31').expect(200);
      expect(svc.getStats).toHaveBeenCalledWith('2026-01-01', '2026-12-31');
    });
  });

  describe('GET /returns/sale/:saleId', () => {
    it('200', async () => {
      await request(app.getHttpServer()).get('/returns/sale/sale-1').expect(200);
      expect(svc.getBySaleId).toHaveBeenCalledWith('sale-1');
    });
  });

  describe('GET /returns/customer/:customerId', () => {
    it('200', async () => {
      await request(app.getHttpServer()).get('/returns/customer/c-1').expect(200);
      expect(svc.getByCustomerId).toHaveBeenCalledWith('c-1');
    });
  });

  describe('GET /returns/:id', () => {
    it('200', async () => {
      const res = await request(app.getHttpServer()).get('/returns/r1').expect(200);
      expect(res.body.id).toBe('r1');
    });
  });

  describe('POST /returns', () => {
    it('201 with valid body', async () => {
      await request(app.getHttpServer()).post('/returns').send(validBody).expect(201);
      expect(svc.create).toHaveBeenCalled();
    });
    it('400 missing items', async () => {
      const { items, ...bad } = validBody;
      await request(app.getHttpServer()).post('/returns').send(bad).expect(400);
    });
    it('400 invalid uuid', async () => {
      await request(app.getHttpServer()).post('/returns').send({ ...validBody, saleId: 'not-uuid' }).expect(400);
    });
    it('400 invalid enum', async () => {
      await request(app.getHttpServer()).post('/returns').send({ ...validBody, returnType: 'nope' }).expect(400);
    });
    it('400 empty items array', async () => {
      await request(app.getHttpServer()).post('/returns').send({ ...validBody, items: [] }).expect(400);
    });
    it('400 negative quantity', async () => {
      const bad = { ...validBody, items: [{ ...validBody.items[0], quantityReturned: -1 }] };
      await request(app.getHttpServer()).post('/returns').send(bad).expect(400);
    });
  });

  describe('PUT /returns/:id', () => {
    it('200 valid update', async () => {
      await request(app.getHttpServer()).put('/returns/r1').send({ notes: 'updated' }).expect(200);
      expect(svc.update).toHaveBeenCalledWith('r1', expect.objectContaining({ notes: 'updated' }));
    });
    it('400 invalid status', async () => {
      await request(app.getHttpServer()).put('/returns/r1').send({ status: 'invalid' }).expect(400);
    });
  });

  describe('DELETE /returns/:id', () => {
    it('200', async () => {
      await request(app.getHttpServer()).delete('/returns/r1').expect(200);
      expect(svc.remove).toHaveBeenCalledWith('r1');
    });
  });

  describe('POST /returns/:id/approve', () => {
    it('201', async () => {
      await request(app.getHttpServer()).post('/returns/r1/approve').send({ processedBy: validUuid }).expect(201);
      expect(svc.approve).toHaveBeenCalledWith('r1', validUuid);
    });
    it('201 without processedBy', async () => {
      await request(app.getHttpServer()).post('/returns/r1/approve').send({}).expect(201);
    });
  });

  describe('POST /returns/:id/reject', () => {
    it('201 with reason', async () => {
      await request(app.getHttpServer()).post('/returns/r1/reject').send({ reason: 'no proof' }).expect(201);
      expect(svc.reject).toHaveBeenCalledWith('r1', expect.objectContaining({ reason: 'no proof' }));
    });
    it('400 invalid processedBy uuid', async () => {
      await request(app.getHttpServer()).post('/returns/r1/reject').send({ processedBy: 'bad' }).expect(400);
    });
  });

  describe('POST /returns/:id/process', () => {
    it('201 with refund amount', async () => {
      await request(app.getHttpServer()).post('/returns/r1/process').send({ refundAmount: 10 }).expect(201);
      expect(svc.process).toHaveBeenCalledWith('r1', expect.objectContaining({ refundAmount: 10 }));
    });
    it('201 with no body', async () => {
      await request(app.getHttpServer()).post('/returns/r1/process').send({}).expect(201);
    });
    it('400 negative refund', async () => {
      await request(app.getHttpServer()).post('/returns/r1/process').send({ refundAmount: -5 }).expect(400);
    });
  });
});
