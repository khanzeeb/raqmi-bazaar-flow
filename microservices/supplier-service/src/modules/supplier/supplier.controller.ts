import {
  Controller, Get, Post, Put, Delete, Param, Query, Body,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import {
  CreateSupplierDto, UpdateSupplierDto, SupplierFiltersDto,
  CreateSupplierContactDto, UpdateSupplierContactDto,
  CreateSupplierRatingDto,
} from './dto';

@Controller('suppliers')
export class SupplierController {
  constructor(private readonly service: SupplierService) {}

  // ─── Supplier CRUD ───

  @Get()
  getAll(@Query() filters: SupplierFiltersDto) {
    return this.service.getAll(filters);
  }

  @Get('stats')
  getStats() {
    return this.service.getStats();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post()
  create(@Body() dto: CreateSupplierDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // ─── Contacts ───

  @Get(':id/contacts')
  getContacts(@Param('id') id: string) {
    return this.service.getContacts(id);
  }

  @Post(':id/contacts')
  addContact(@Param('id') id: string, @Body() dto: CreateSupplierContactDto) {
    return this.service.addContact(id, dto);
  }

  @Put(':id/contacts/:contactId')
  updateContact(
    @Param('id') id: string,
    @Param('contactId') contactId: string,
    @Body() dto: UpdateSupplierContactDto,
  ) {
    return this.service.updateContact(id, contactId, dto);
  }

  @Delete(':id/contacts/:contactId')
  removeContact(@Param('id') id: string, @Param('contactId') contactId: string) {
    return this.service.removeContact(id, contactId);
  }

  // ─── Ratings ───

  @Get(':id/ratings')
  getRatings(@Param('id') id: string) {
    return this.service.getRatings(id);
  }

  @Get(':id/ratings/average')
  getAverageRating(@Param('id') id: string) {
    return this.service.getAverageRating(id);
  }

  @Post(':id/ratings')
  addRating(@Param('id') id: string, @Body() dto: CreateSupplierRatingDto) {
    return this.service.addRating(id, dto);
  }
}
