import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { MemberService } from './member.service';
import { AddMemberDto, UpdateMemberDto, QueryMembersDto } from './dto';

@Controller('organizations/:orgId/members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  findAll(@Param('orgId') orgId: string, @Query() query: QueryMembersDto) {
    return this.memberService.findAll(orgId, query);
  }

  @Get(':id')
  findOne(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.memberService.findOne(orgId, id);
  }

  @Get('user/:userId')
  findByUser(@Param('orgId') orgId: string, @Param('userId') userId: string) {
    return this.memberService.findByUser(orgId, userId);
  }

  @Post()
  add(
    @Param('orgId') orgId: string,
    @Body() addDto: AddMemberDto,
    @Headers('x-user-id') userId: string
  ) {
    return this.memberService.add(orgId, addDto, userId);
  }

  @Put(':id')
  update(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateMemberDto,
    @Headers('x-user-id') userId: string
  ) {
    return this.memberService.update(orgId, id, updateDto, userId);
  }

  @Put(':id/role')
  updateRole(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() body: { roleId: string },
    @Headers('x-user-id') userId: string
  ) {
    return this.memberService.updateRole(orgId, id, body.roleId, userId);
  }

  @Put(':id/deactivate')
  deactivate(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Headers('x-user-id') userId: string
  ) {
    return this.memberService.deactivate(orgId, id, userId);
  }

  @Put(':id/reactivate')
  reactivate(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Headers('x-user-id') userId: string
  ) {
    return this.memberService.reactivate(orgId, id, userId);
  }

  @Delete(':id')
  remove(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Headers('x-user-id') userId: string
  ) {
    return this.memberService.remove(orgId, id, userId);
  }
}
