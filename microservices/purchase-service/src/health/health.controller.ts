import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  check() {
    return {
      status: 'OK',
      service: 'purchase-service',
      timestamp: new Date().toISOString(),
    };
  }
}
