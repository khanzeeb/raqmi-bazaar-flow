import { Controller, Get, Post, Put, Delete, Body, Param, Headers } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto, UpdateRolePermissionsDto, BulkUpdatePermissionsDto } from './dto';

@Controller('organizations/:orgId/roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.roleService.findAll(orgId);
  }

  @Get('permissions')
  getAllPermissions() {
    return this.roleService.getAllPermissions();
  }

  @Get(':id')
  findOne(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.roleService.findOne(orgId, id);
  }

  @Post()
  create(
    @Param('orgId') orgId: string,
    @Body() createDto: CreateRoleDto,
    @Headers('x-user-id') userId: string
  ) {
    return this.roleService.create(orgId, createDto, userId);
  }

  @Put(':id')
  update(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateRoleDto,
    @Headers('x-user-id') userId: string
  ) {
    return this.roleService.update(orgId, id, updateDto, userId);
  }

  @Put(':id/permissions')
  updatePermissions(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRolePermissionsDto,
    @Headers('x-user-id') userId: string
  ) {
    return this.roleService.updatePermissions(orgId, id, dto.permissions, userId);
  }

  @Put('bulk/permissions')
  bulkUpdatePermissions(
    @Param('orgId') orgId: string,
    @Body() dto: BulkUpdatePermissionsDto,
    @Headers('x-user-id') userId: string
  ) {
    return this.roleService.bulkUpdatePermissions(orgId, dto.updates, userId);
  }

  @Delete(':id')
  remove(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Headers('x-user-id') userId: string
  ) {
    return this.roleService.remove(orgId, id, userId);
  }
}
