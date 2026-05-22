import { ReturnEventHandler } from '../events/return-event.handler';
import { ReturnRepository } from '../return.repository';

describe('ReturnEventHandler', () => {
  let handler: ReturnEventHandler;
  let repo: jest.Mocked<Partial<ReturnRepository>>;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    repo = {} as any;
    handler = new ReturnEventHandler(repo as ReturnRepository);
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => logSpy.mockRestore());

  it('logs sale.cancelled with sale_id', async () => {
    await handler.onSaleCancelled({ sale_id: 'sale-1' });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('sale.cancelled: sale-1'));
  });

  it('logs payment.refunded with payment_id', async () => {
    await handler.onPaymentRefunded({ payment_id: 'pay-1' });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('payment.refunded: pay-1'));
  });

  it('logs inventory.restock_failed with return_id', async () => {
    await handler.onRestockFailed({ return_id: 'ret-1' });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('inventory.restock_failed: ret-1'));
  });

  it('handles missing payload fields gracefully', async () => {
    await expect(handler.onSaleCancelled(undefined as any)).resolves.toBeUndefined();
    await expect(handler.onPaymentRefunded({})).resolves.toBeUndefined();
    await expect(handler.onRestockFailed(null as any)).resolves.toBeUndefined();
  });
});
