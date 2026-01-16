import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto, UpdateOrganizationDto, QueryOrganizationDto } from './dto';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  create(@Body() createDto: CreateOrganizationDto) {
    return this.organizationService.create(createDto);
  }

  @Get()
  findAll(@Query() query: QueryOrganizationDto) {
    return this.organizationService.findAll(query);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.organizationService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.organizationService.findBySlug(slug);
  }

  @Put(':id')
  update(
    @Param('id') id: string, 
    @Body() updateDto: UpdateOrganizationDto,
    @Headers('x-user-id') userId: string
  ) {
    return this.organizationService.update(id, updateDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    return this.organizationService.remove(id, userId);
  }

  // Kafka message handlers
  @MessagePattern('organization.get')
  async getOrganization(@Payload() data: { organizationId: string }) {
    return this.organizationService.findOne(data.organizationId);
  }

  @MessagePattern('organization.validate-access')
  async validateAccess(@Payload() data: { organizationId: string; userId: string; permission?: string }) {
    return this.organizationService.validateAccess(data.organizationId, data.userId, data.permission);
  }

  @EventPattern('user.deleted')
  async handleUserDeleted(@Payload() data: { userId: string }) {
    return this.organizationService.handleUserDeleted(data.userId);
  }
}
