import {
  Controller, Get, Post, Put, Delete, Param, Query, Body,
} from '@nestjs/common';
import { ReturnService } from './return.service';
import {
  CreateReturnDto, UpdateReturnDto, ReturnFiltersDto,
  ProcessReturnDto, RejectReturnDto,
} from './dto';

@Controller('returns')
export class ReturnController {
  constructor(private readonly service: ReturnService) {}

  // ─── CRUD ───

  @Get()
  getAll(@Query() filters: ReturnFiltersDto) {
    return this.service.getAll(filters);
  }

  @Get('stats')
  getStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.service.getStats(dateFrom, dateTo);
  }

  @Get('sale/:saleId')
  getBySaleId(@Param('saleId') saleId: string) {
    return this.service.getBySaleId(saleId);
  }

  @Get('customer/:customerId')
  getByCustomerId(@Param('customerId') customerId: string) {
    return this.service.getByCustomerId(customerId);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post()
  create(@Body() dto: CreateReturnDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReturnDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // ─── Workflow ───

  @Post(':id/approve')
  approve(@Param('id') id: string, @Body('processedBy') processedBy?: string) {
    return this.service.approve(id, processedBy);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() dto: RejectReturnDto) {
    return this.service.reject(id, dto);
  }

  @Post(':id/process')
  process(@Param('id') id: string, @Body() dto: ProcessReturnDto) {
    return this.service.process(id, dto);
  }
}
