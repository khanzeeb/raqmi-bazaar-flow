import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MemberService } from './member.service';
import { AddMemberDto, UpdateMemberDto, QueryMembersDto } from './dto';
import { CurrentUser, CurrentUserData, RequirePermissions } from '../auth/decorators';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Controller('organizations/:orgId/members')
@UseGuards(PermissionsGuard)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  @RequirePermissions('users:view')
  findAll(@Param('orgId') orgId: string, @Query() query: QueryMembersDto) {
    return this.memberService.findAll(orgId, query);
  }

  @Get(':id')
  @RequirePermissions('users:view')
  findOne(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.memberService.findOne(orgId, id);
  }

  @Get('user/:userId')
  @RequirePermissions('users:view')
  findByUser(@Param('orgId') orgId: string, @Param('userId') userId: string) {
    return this.memberService.findByUser(orgId, userId);
  }

  @Post()
  @RequirePermissions('users:manage')
  add(
    @Param('orgId') orgId: string,
    @Body() addDto: AddMemberDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.memberService.add(orgId, addDto, user.id);
  }

  @Put(':id')
  @RequirePermissions('users:manage')
  update(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateMemberDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.memberService.update(orgId, id, updateDto, user.id);
  }

  @Put(':id/role')
  @RequirePermissions('users:manage')
  updateRole(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() body: { roleId: string },
    @CurrentUser() user: CurrentUserData
  ) {
    return this.memberService.updateRole(orgId, id, body.roleId, user.id);
  }

  @Put(':id/deactivate')
  @RequirePermissions('users:manage')
  deactivate(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.memberService.deactivate(orgId, id, user.id);
  }

  @Put(':id/reactivate')
  @RequirePermissions('users:manage')
  reactivate(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.memberService.reactivate(orgId, id, user.id);
  }

  @Delete(':id')
  @RequirePermissions('users:manage')
  remove(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.memberService.remove(orgId, id, user.id);
  }
}
