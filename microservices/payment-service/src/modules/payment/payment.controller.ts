import {
  Controller, Get, Post, Put, Delete, Param, Query, Body,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentService } from './payment.service';
import {
  CreatePaymentDto, UpdatePaymentDto, PaymentFiltersDto,
  AllocatePaymentDto, CompletePaymentDto,
} from './dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  // ─── CRUD ───

  @Get()
  getAll(@Query() filters: PaymentFiltersDto) {
    return this.service.getAll(filters);
  }

  @Get('stats')
  getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getStats(startDate, endDate);
  }

  @Get('customer/:customerId')
  getCustomerPayments(@Param('customerId') customerId: string) {
    return this.service.getCustomerPayments(customerId);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // ─── Workflow ───

  @Post(':id/complete')
  complete(@Param('id') id: string, @Body() dto: CompletePaymentDto) {
    return this.service.complete(id, dto);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.service.cancel(id);
  }

  @Post('allocate')
  allocate(@Body() dto: AllocatePaymentDto) {
    return this.service.allocate(dto);
  }

  // ─── Kafka message handlers ───

  @MessagePattern('payment.get')
  onGetPayment(@Payload() data: { paymentId: string }) {
    return this.service.getById(data.paymentId);
  }

  @MessagePattern('payment.getByCustomer')
  onGetByCustomer(@Payload() data: { customerId: string }) {
    return this.service.getCustomerPayments(data.customerId);
  }
}
