import { Controller, Post, Body } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CheckStockDto, ReserveStockDto, ReleaseStockDto } from './dto';

@Controller('inventory')
export class ReservationController {
  constructor(private readonly service: ReservationService) {}

  @Post('check-stock')
  checkStock(@Body() dto: CheckStockDto) {
    return this.service.checkStock(dto);
  }

  @Post('reserve')
  reserve(@Body() dto: ReserveStockDto) {
    return this.service.reserve(dto);
  }

  @Post('release')
  release(@Body() dto: ReleaseStockDto) {
    return this.service.release(dto);
  }
}
