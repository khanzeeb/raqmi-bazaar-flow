import {
  Controller, Get, Post, Put, Delete, Patch, Param, Query, Body,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import {
  CreatePurchaseDto, UpdatePurchaseDto, PurchaseFiltersDto,
  UpdateStatusDto, ReceivePurchaseDto, AddPaymentDto,
} from './dto';

@Controller('purchases')
export class PurchaseController {
  constructor(private readonly service: PurchaseService) {}

  @Get()
  getAll(@Query() filters: PurchaseFiltersDto) {
    return this.service.getAll(filters);
  }

  @Get('stats')
  getStats(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.service.getStats({ startDate, endDate });
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post()
  create(@Body() dto: CreatePurchaseDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.service.updateStatus(id, dto);
  }

  @Post(':id/receive')
  receive(@Param('id') id: string, @Body() dto: ReceivePurchaseDto) {
    return this.service.receivePurchase(id, dto);
  }

  @Post(':id/payment')
  addPayment(@Param('id') id: string, @Body() dto: AddPaymentDto) {
    return this.service.addPayment(id, dto);
  }
}
