import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.create(createInvoiceDto);
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
    return this.invoiceService.findAll({
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
    return this.invoiceService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoiceService.update(id, updateInvoiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invoiceService.remove(id);
  }

  @Post(':id/send')
  sendInvoice(@Param('id') id: string) {
    return this.invoiceService.sendInvoice(id);
  }

  // Kafka event handlers
  @EventPattern('order.created')
  async handleOrderCreated(@Payload() data: any) {
    // Auto-generate invoice from order
    const invoiceDto: CreateInvoiceDto = {
      orderId: data.orderId,
      customerId: data.customerId,
      customerName: data.customerName || 'Customer',
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      items: data.items.map((item: any) => ({
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        discountAmount: Number(item.discountAmount || 0),
        taxAmount: Number(item.taxAmount || 0),
      })),
    };

    await this.invoiceService.create(invoiceDto);
  }

  @EventPattern('payment.allocated')
  async handlePaymentAllocated(@Payload() data: { invoiceId: string; paymentId: string; amount: number }) {
    await this.invoiceService.applyPayment(data.invoiceId, data.paymentId, data.amount);
  }

  @MessagePattern('invoice.get')
  async getInvoice(@Payload() data: { invoiceId: string }) {
    return this.invoiceService.findOne(data.invoiceId);
  }

  @MessagePattern('invoice.getByOrder')
  async getInvoiceByOrder(@Payload() data: { orderId: string }) {
    const result = await this.invoiceService.findAll({ search: data.orderId });
    return result.data.find(inv => inv.orderId === data.orderId);
  }
}
