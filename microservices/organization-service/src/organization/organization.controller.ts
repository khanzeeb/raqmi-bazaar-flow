import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto, UpdateOrganizationDto, QueryOrganizationDto } from './dto';
import { CurrentUser, CurrentUserData, Public, RequirePermissions } from '../auth/decorators';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  create(@Body() createDto: CreateOrganizationDto, @CurrentUser() user: CurrentUserData) {
    // Override owner info with authenticated user
    return this.organizationService.create({
      ...createDto,
      ownerId: user.id,
      ownerEmail: user.email,
      ownerName: user.name || user.email,
    });
  }

  @Get()
  findAll(@Query() query: QueryOrganizationDto, @CurrentUser() user: CurrentUserData) {
    // Users can only see their own organizations
    return this.organizationService.findAll({ ...query, userId: user.id });
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string, @CurrentUser() user: CurrentUserData) {
    // Users can only query their own organizations
    if (userId !== user.id) {
      return [];
    }
    return this.organizationService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(id);
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.organizationService.findBySlug(slug);
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('org:manage')
  update(
    @Param('id') id: string, 
    @Body() updateDto: UpdateOrganizationDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.organizationService.update(id, updateDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.organizationService.remove(id, user.id);
  }

  // Kafka message handlers (internal, no auth needed)
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
