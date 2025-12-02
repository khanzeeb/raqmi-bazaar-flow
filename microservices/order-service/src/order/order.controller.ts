import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
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
    return this.orderService.findAll({
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
    return this.orderService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }

  // Kafka event handlers
  @EventPattern('payment.completed')
  async handlePaymentCompleted(@Payload() data: { orderId: string; amount: number }) {
    // Update order payment status when payment is completed
    const order = await this.orderService.findOne(data.orderId);
    const newPaidAmount = order.paidAmount.toNumber() + data.amount;
    const newBalance = order.totalAmount.toNumber() - newPaidAmount;

    let paymentStatus = 'PARTIALLY_PAID';
    if (newBalance <= 0) paymentStatus = 'PAID';
    if (newPaidAmount === 0) paymentStatus = 'UNPAID';

    await this.orderService.update(data.orderId, {
      paymentStatus: paymentStatus as any,
    });
  }

  @MessagePattern('order.get')
  async getOrder(@Payload() data: { orderId: string }) {
    return this.orderService.findOne(data.orderId);
  }
}
