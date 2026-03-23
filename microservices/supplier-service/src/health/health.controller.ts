import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  check() {
    return {
      status: 'OK',
      service: 'supplier-service',
      timestamp: new Date().toISOString(),
    };
  }
}
