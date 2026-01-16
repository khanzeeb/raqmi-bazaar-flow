import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { InviteService } from './invite.service';
import { CreateInviteDto, AcceptInviteDto, QueryInvitesDto } from './dto';

@Controller()
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  // Organization-scoped routes
  @Get('organizations/:orgId/invites')
  findAll(@Param('orgId') orgId: string, @Query() query: QueryInvitesDto) {
    return this.inviteService.findAll(orgId, query);
  }

  @Post('organizations/:orgId/invites')
  create(
    @Param('orgId') orgId: string,
    @Body() createDto: CreateInviteDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-name') userName: string
  ) {
    return this.inviteService.create(orgId, createDto, userId, userName);
  }

  @Delete('organizations/:orgId/invites/:id')
  cancel(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Headers('x-user-id') userId: string
  ) {
    return this.inviteService.cancel(orgId, id, userId);
  }

  @Post('organizations/:orgId/invites/:id/resend')
  resend(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Headers('x-user-id') userId: string
  ) {
    return this.inviteService.resend(orgId, id, userId);
  }

  // Public routes for accepting invites
  @Get('invites/:token')
  getByToken(@Param('token') token: string) {
    return this.inviteService.getByToken(token);
  }

  @Post('invites/accept')
  accept(@Body() acceptDto: AcceptInviteDto) {
    return this.inviteService.accept(acceptDto);
  }

  // User's pending invites
  @Get('users/:userId/invites')
  findUserInvites(@Param('userId') userId: string, @Query('email') email: string) {
    return this.inviteService.findByEmail(email);
  }
}
