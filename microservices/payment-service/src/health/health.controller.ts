import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'OK',
      service: 'payment-service',
      timestamp: new Date().toISOString(),
    };
  }
}
