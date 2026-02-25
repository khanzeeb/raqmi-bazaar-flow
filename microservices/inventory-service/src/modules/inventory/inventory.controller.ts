import {
  Controller, Get, Post, Put, Delete, Param, Query, Body,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import {
  CreateInventoryDto, UpdateInventoryDto, InventoryFiltersDto,
  AdjustStockDto, TransferStockDto,
} from './dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get()
  getAll(@Query() filters: InventoryFiltersDto) {
    return this.service.getAll(filters);
  }

  @Get('low-stock')
  getLowStock(@Query('threshold') threshold?: number) {
    return this.service.getLowStockItems(threshold);
  }

  @Get('stats')
  getStats(@Query('category') category?: string, @Query('location') location?: string) {
    return this.service.getStats({ category, location });
  }

  @Get('movements/:productId')
  getMovements(@Param('productId') productId: string) {
    return this.service.getMovements(productId);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post()
  create(@Body() dto: CreateInventoryDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInventoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/adjust')
  adjustStock(@Param('id') id: string, @Body() dto: AdjustStockDto) {
    return this.service.adjustStock(id, dto);
  }

  @Post(':id/transfer')
  transferStock(@Param('id') id: string, @Body() dto: TransferStockDto) {
    return this.service.transferStock(id, dto);
  }
}
