import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto, UpdateRolePermissionsDto, BulkUpdatePermissionsDto } from './dto';
import { CurrentUser, CurrentUserData, Public, RequirePermissions } from '../auth/decorators';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Controller('organizations/:orgId/roles')
@UseGuards(PermissionsGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @RequirePermissions('users:view')
  findAll(@Param('orgId') orgId: string) {
    return this.roleService.findAll(orgId);
  }

  @Public()
  @Get('permissions')
  getAllPermissions() {
    return this.roleService.getAllPermissions();
  }

  @Get(':id')
  @RequirePermissions('users:view')
  findOne(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.roleService.findOne(orgId, id);
  }

  @Post()
  @RequirePermissions('org:manage')
  create(
    @Param('orgId') orgId: string,
    @Body() createDto: CreateRoleDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.roleService.create(orgId, createDto, user.id);
  }

  @Put(':id')
  @RequirePermissions('org:manage')
  update(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateRoleDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.roleService.update(orgId, id, updateDto, user.id);
  }

  @Put(':id/permissions')
  @RequirePermissions('org:manage')
  updatePermissions(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRolePermissionsDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.roleService.updatePermissions(orgId, id, dto.permissions, user.id);
  }

  @Put('bulk/permissions')
  @RequirePermissions('org:manage')
  bulkUpdatePermissions(
    @Param('orgId') orgId: string,
    @Body() dto: BulkUpdatePermissionsDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.roleService.bulkUpdatePermissions(orgId, dto.updates, user.id);
  }

  @Delete(':id')
  @RequirePermissions('org:manage')
  remove(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.roleService.remove(orgId, id, user.id);
  }
}
