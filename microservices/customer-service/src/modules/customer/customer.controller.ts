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
import { CustomerService } from './customer.service';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  UpdateCreditDto,
  BlockCustomerDto,
  UnblockCustomerDto,
  CustomerFiltersDto,
  CreditHistoryFiltersDto,
} from './dto';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateCustomerDto,
    @Headers('accept-language') language?: string,
  ) {
    const customer = await this.customerService.create(createDto);
    return {
      success: true,
      message: language === 'ar' ? 'تم إنشاء العميل بنجاح' : 'Customer created successfully',
      data: customer,
    };
  }

  @Get()
  async findAll(@Query() filters: CustomerFiltersDto) {
    const result = await this.customerService.findAll(filters);
    return {
      success: true,
      message: 'Customers retrieved successfully',
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const customer = await this.customerService.findById(id);
    return {
      success: true,
      message: 'Customer retrieved successfully',
      data: customer,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCustomerDto,
    @Headers('accept-language') language?: string,
  ) {
    const customer = await this.customerService.update(id, updateDto);
    return {
      success: true,
      message: language === 'ar' ? 'تم تحديث العميل بنجاح' : 'Customer updated successfully',
      data: customer,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Headers('accept-language') language?: string,
  ) {
    await this.customerService.delete(id);
    return {
      success: true,
      message: language === 'ar' ? 'تم حذف العميل بنجاح' : 'Customer deleted successfully',
      data: { deleted: true },
    };
  }

  @Post(':id/credit')
  async updateCredit(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCreditDto: UpdateCreditDto,
    @Headers('accept-language') language?: string,
  ) {
    const customer = await this.customerService.updateCredit(id, updateCreditDto);
    return {
      success: true,
      message: language === 'ar' ? 'تم تحديث الائتمان بنجاح' : 'Credit updated successfully',
      data: customer,
    };
  }

  @Get(':id/credit-history')
  async getCreditHistory(
    @Param('id', ParseIntPipe) id: number,
    @Query() filters: CreditHistoryFiltersDto,
  ) {
    const history = await this.customerService.getCreditHistory(id, filters);
    return {
      success: true,
      message: 'Credit history retrieved successfully',
      data: history,
    };
  }

  @Get(':id/stats')
  async getStats(@Param('id', ParseIntPipe) id: number) {
    const stats = await this.customerService.getCustomerStats(id);
    return {
      success: true,
      message: 'Customer statistics retrieved successfully',
      data: stats,
    };
  }

  @Post(':id/block')
  async block(
    @Param('id', ParseIntPipe) id: number,
    @Body() blockDto: BlockCustomerDto,
    @Headers('accept-language') language?: string,
  ) {
    const customer = await this.customerService.blockCustomer(id, blockDto.reason);
    return {
      success: true,
      message: language === 'ar' ? 'تم حظر العميل بنجاح' : 'Customer blocked successfully',
      data: customer,
    };
  }

  @Post(':id/unblock')
  async unblock(
    @Param('id', ParseIntPipe) id: number,
    @Body() unblockDto: UnblockCustomerDto,
    @Headers('accept-language') language?: string,
  ) {
    const customer = await this.customerService.unblockCustomer(id, unblockDto.reason);
    return {
      success: true,
      message: language === 'ar' ? 'تم إلغاء حظر العميل بنجاح' : 'Customer unblocked successfully',
      data: customer,
    };
  }
}
