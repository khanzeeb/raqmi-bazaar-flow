import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AllocatePaymentDto } from './dto/allocate-payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.paymentService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
      status,
      customerId,
      startDate,
      endDate,
    });
  }

  @Get('stats')
  getStats() {
    return this.paymentService.getStats();
  }

  @Get('customer/:customerId')
  getCustomerPayments(@Param('customerId') customerId: string) {
    return this.paymentService.getCustomerPayments(customerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string, @Body('approvedBy') approvedBy?: string) {
    return this.paymentService.complete(id, approvedBy);
  }

  @Post('allocate')
  allocate(@Body() allocateDto: AllocatePaymentDto) {
    return this.paymentService.allocate(allocateDto);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.paymentService.cancel(id);
  }

  // Kafka message handlers
  @MessagePattern('payment.get')
  async getPayment(@Payload() data: { paymentId: string }) {
    return this.paymentService.findOne(data.paymentId);
  }

  @MessagePattern('payment.getByCustomer')
  async getPaymentsByCustomer(@Payload() data: { customerId: string }) {
    return this.paymentService.getCustomerPayments(data.customerId);
  }
}
