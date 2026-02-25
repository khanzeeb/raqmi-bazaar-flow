import {
  Controller, Get, Post, Put, Delete, Param, Query, Body,
} from '@nestjs/common';
import { PricingService } from './pricing.service';
import {
  CreatePricingRuleDto, UpdatePricingRuleDto,
  PricingFiltersDto, CalculatePriceDto,
} from './dto';

@Controller('pricing')
export class PricingController {
  constructor(private readonly service: PricingService) {}

  @Get()
  getAll(@Query() filters: PricingFiltersDto) {
    return this.service.getAll(filters);
  }

  @Get('stats')
  getStats() {
    return this.service.getStats();
  }

  @Post('calculate')
  calculate(@Body() dto: CalculatePriceDto) {
    return this.service.calculatePrice(dto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post()
  create(@Body() dto: CreatePricingRuleDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePricingRuleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/activate')
  activate(@Param('id') id: string) {
    return this.service.activate(id);
  }

  @Post(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }
}
