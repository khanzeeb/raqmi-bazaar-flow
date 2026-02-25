import {
  Controller, Get, Post, Put, Delete, Patch, Param, Query, Body,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import {
  CreateExpenseDto, UpdateExpenseDto, ExpenseFiltersDto,
  UpdateStatusDto, AttachReceiptDto,
} from './dto';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly service: ExpenseService) {}

  @Get()
  getAll(@Query() filters: ExpenseFiltersDto) {
    return this.service.getAll(filters);
  }

  @Get('stats/summary')
  getStats(@Query() filters: ExpenseFiltersDto) {
    return this.service.getStats(filters);
  }

  @Get('stats/by-category')
  getByCategory(@Query() filters: ExpenseFiltersDto) {
    return this.service.getByCategory(filters);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post()
  create(@Body() dto: CreateExpenseDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.service.approve(id);
  }

  @Post(':id/receipt')
  attachReceipt(@Param('id') id: string, @Body() dto: AttachReceiptDto) {
    return this.service.attachReceipt(id, dto.receiptUrl);
  }
}
