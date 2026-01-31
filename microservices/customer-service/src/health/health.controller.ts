import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      service: 'customer-service',
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }
}
