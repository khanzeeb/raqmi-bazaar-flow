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
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryFiltersDto } from './dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateCategoryDto,
    @Headers('accept-language') language?: string,
  ) {
    const category = await this.categoryService.create(dto);
    return {
      success: true,
      message: language === 'ar' ? 'تم إنشاء التصنيف بنجاح' : 'Category created successfully',
      data: category,
    };
  }

  @Get()
  async findAll(@Query() filters: CategoryFiltersDto) {
    const result = await this.categoryService.findAll(filters);
    return {
      success: true,
      message: 'Categories retrieved successfully',
      data: result,
    };
  }

  @Get('tree')
  async getTree() {
    const tree = await this.categoryService.getTree();
    return {
      success: true,
      message: 'Category tree retrieved successfully',
      data: tree,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const category = await this.categoryService.findById(id);
    return {
      success: true,
      message: 'Category retrieved successfully',
      data: category,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
    @Headers('accept-language') language?: string,
  ) {
    const category = await this.categoryService.update(id, dto);
    return {
      success: true,
      message: language === 'ar' ? 'تم تحديث التصنيف بنجاح' : 'Category updated successfully',
      data: category,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('accept-language') language?: string,
  ) {
    await this.categoryService.delete(id);
    return {
      success: true,
      message: language === 'ar' ? 'تم حذف التصنيف بنجاح' : 'Category deleted successfully',
      data: { deleted: true },
    };
  }
}
