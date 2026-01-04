import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { QuotationService } from './quotation.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto, DeclineQuotationDto, UpdateStatusDto } from './dto/update-quotation.dto';
import { QuotationQueryDto } from './dto/quotation-query.dto';

@Controller('quotations')
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}

  @Post()
  async create(@Body() createQuotationDto: CreateQuotationDto) {
    const quotation = await this.quotationService.create(createQuotationDto);
    return {
      success: true,
      data: quotation,
      message: 'Quotation created successfully',
    };
  }

  @Get()
  async findAll(@Query() query: QuotationQueryDto) {
    const result = await this.quotationService.findAll(query);
    return {
      success: true,
      data: result,
    };
  }

  @Get('stats')
  async getStats(
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
  ) {
    const stats = await this.quotationService.getStats({ dateFrom, dateTo });
    return {
      success: true,
      data: stats,
    };
  }

  @Get('expired')
  async getExpired() {
    const quotations = await this.quotationService.getExpired();
    return {
      success: true,
      data: quotations,
    };
  }

  @Get('report')
  async getReport(@Query() query: QuotationQueryDto) {
    const report = await this.quotationService.getReport(query);
    return {
      success: true,
      data: report,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const quotation = await this.quotationService.findOne(id);
    return {
      success: true,
      data: quotation,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateQuotationDto: UpdateQuotationDto) {
    const quotation = await this.quotationService.update(id, updateQuotationDto);
    return {
      success: true,
      data: quotation,
      message: 'Quotation updated successfully',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.quotationService.remove(id);
    return {
      success: true,
      message: 'Quotation deleted successfully',
    };
  }

  @Post(':id/send')
  async send(@Param('id') id: string) {
    const quotation = await this.quotationService.send(id);
    return {
      success: true,
      data: quotation,
      message: 'Quotation sent successfully',
    };
  }

  @Post(':id/accept')
  async accept(@Param('id') id: string) {
    const quotation = await this.quotationService.accept(id);
    return {
      success: true,
      data: quotation,
      message: 'Quotation accepted successfully',
    };
  }

  @Post(':id/decline')
  async decline(@Param('id') id: string, @Body() declineDto: DeclineQuotationDto) {
    const quotation = await this.quotationService.decline(id, declineDto.reason);
    return {
      success: true,
      data: quotation,
      message: 'Quotation declined successfully',
    };
  }

  @Post(':id/convert-to-sale')
  async convertToSale(@Param('id') id: string) {
    const result = await this.quotationService.convertToSale(id);
    return {
      success: true,
      data: result,
      message: 'Quotation converted to sale successfully',
    };
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() statusDto: UpdateStatusDto) {
    const quotation = await this.quotationService.updateStatus(id, statusDto.status);
    return {
      success: true,
      data: quotation,
      message: 'Quotation status updated successfully',
    };
  }

  @Post('process-expired')
  async processExpired() {
    const count = await this.quotationService.processExpired();
    return {
      success: true,
      data: { processed_count: count },
      message: `${count} expired quotations processed successfully`,
    };
  }

  // Kafka event handlers
  @EventPattern('order.created.from.quotation')
  async handleOrderCreated(@Payload() data: { quotationId: string; orderId: string }) {
    // Update quotation with the created order ID
    const quotation = await this.quotationService.findOne(data.quotationId);
    if (quotation) {
      await this.quotationService.updateStatus(data.quotationId, quotation.status);
    }
  }

  @MessagePattern('quotation.get')
  async getQuotation(@Payload() data: { quotationId: string }) {
    return this.quotationService.findOne(data.quotationId);
  }
}
