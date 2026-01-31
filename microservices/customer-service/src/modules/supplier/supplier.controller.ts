import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import {
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierFiltersDto,
  SupplierPurchasesFiltersDto,
} from './dto';

@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateSupplierDto,
    @Headers('accept-language') language?: string,
  ) {
    const supplier = await this.supplierService.create(createDto);
    return {
      success: true,
      message: language === 'ar' ? 'تم إنشاء المورد بنجاح' : 'Supplier created successfully',
      data: supplier,
    };
  }

  @Get()
  async findAll(@Query() filters: SupplierFiltersDto) {
    const result = await this.supplierService.findAll(filters);
    return {
      success: true,
      message: 'Suppliers retrieved successfully',
      data: result,
    };
  }

  @Get('stats')
  async getStats() {
    const stats = await this.supplierService.getSupplierStats();
    return {
      success: true,
      message: 'Supplier statistics retrieved successfully',
      data: stats,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const supplier = await this.supplierService.findById(id);
    return {
      success: true,
      message: 'Supplier retrieved successfully',
      data: supplier,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSupplierDto,
    @Headers('accept-language') language?: string,
  ) {
    const supplier = await this.supplierService.update(id, updateDto);
    return {
      success: true,
      message: language === 'ar' ? 'تم تحديث المورد بنجاح' : 'Supplier updated successfully',
      data: supplier,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Headers('accept-language') language?: string,
  ) {
    await this.supplierService.delete(id);
    return {
      success: true,
      message: language === 'ar' ? 'تم حذف المورد بنجاح' : 'Supplier deleted successfully',
      data: { deleted: true },
    };
  }

  @Get(':id/purchases')
  async getPurchases(
    @Param('id', ParseIntPipe) id: number,
    @Query() filters: SupplierPurchasesFiltersDto,
  ) {
    const purchases = await this.supplierService.getSupplierPurchases(id, filters);
    return {
      success: true,
      message: 'Supplier purchases retrieved successfully',
      data: purchases,
    };
  }
}
