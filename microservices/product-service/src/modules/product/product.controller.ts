import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Headers,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateStockDto,
  ProductFiltersDto,
  CreateVariantDto,
  UpdateVariantDto,
} from './dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateProductDto,
    @Headers('accept-language') language?: string,
  ) {
    const product = await this.productService.create(createDto);
    return {
      success: true,
      message: language === 'ar' ? 'تم إنشاء المنتج بنجاح' : 'Product created successfully',
      data: product,
    };
  }

  @Get()
  async findAll(@Query() filters: ProductFiltersDto) {
    const result = await this.productService.findAll(filters);
    return {
      success: true,
      message: 'Products retrieved successfully',
      data: result,
    };
  }

  @Get('stats')
  async getStats() {
    const stats = await this.productService.getStats();
    return {
      success: true,
      message: 'Product stats retrieved successfully',
      data: stats,
    };
  }

  @Get('low-stock')
  async getLowStock(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const products = await this.productService.getLowStockProducts(limit);
    return {
      success: true,
      message: 'Low stock products retrieved successfully',
      data: products,
    };
  }

  @Get('suppliers')
  async getSuppliers() {
    const suppliers = await this.productService.getSuppliers();
    return {
      success: true,
      message: 'Suppliers retrieved successfully',
      data: suppliers,
    };
  }

  @Get('categories')
  async getCategories() {
    const categories = await this.productService.getCategories();
    return {
      success: true,
      message: 'Categories retrieved successfully',
      data: categories,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const product = await this.productService.findById(id);
    return {
      success: true,
      message: 'Product retrieved successfully',
      data: product,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateProductDto,
    @Headers('accept-language') language?: string,
  ) {
    const product = await this.productService.update(id, updateDto);
    return {
      success: true,
      message: language === 'ar' ? 'تم تحديث المنتج بنجاح' : 'Product updated successfully',
      data: product,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('accept-language') language?: string,
  ) {
    await this.productService.delete(id);
    return {
      success: true,
      message: language === 'ar' ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully',
      data: { deleted: true },
    };
  }

  @Put(':id/stock')
  async updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStockDto,
    @Headers('accept-language') language?: string,
  ) {
    const product = await this.productService.updateStock(id, dto);
    return {
      success: true,
      message: language === 'ar' ? 'تم تحديث المخزون بنجاح' : 'Stock updated successfully',
      data: product,
    };
  }

  // ============= Variant Endpoints =============

  @Get(':productId/variants')
  async getVariants(@Param('productId', ParseUUIDPipe) productId: string) {
    const variants = await this.productService.getVariantsByProductId(productId);
    return {
      success: true,
      message: 'Variants retrieved successfully',
      data: variants,
    };
  }

  @Post(':productId/variants')
  @HttpCode(HttpStatus.CREATED)
  async createVariant(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: CreateVariantDto,
  ) {
    const variant = await this.productService.createVariant(productId, dto);
    return {
      success: true,
      message: 'Variant created successfully',
      data: variant,
    };
  }

  @Put('variants/:id')
  async updateVariant(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVariantDto,
  ) {
    const variant = await this.productService.updateVariant(id, dto);
    return {
      success: true,
      message: 'Variant updated successfully',
      data: variant,
    };
  }

  @Delete('variants/:id')
  async deleteVariant(@Param('id', ParseUUIDPipe) id: string) {
    await this.productService.deleteVariant(id);
    return {
      success: true,
      message: 'Variant deleted successfully',
      data: { deleted: true },
    };
  }
}
