import { HealthController } from '../health.controller';

describe('HealthController', () => {
  const controller = new HealthController();

  it('returns OK status with service name and ISO timestamp', () => {
    const res = controller.check();
    expect(res.status).toBe('OK');
    expect(res.service).toBe('return-service');
    expect(() => new Date(res.timestamp).toISOString()).not.toThrow();
    expect(new Date(res.timestamp).toString()).not.toBe('Invalid Date');
  });
});
