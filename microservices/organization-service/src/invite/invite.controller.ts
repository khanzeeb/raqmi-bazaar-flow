import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InviteService } from './invite.service';
import { CreateInviteDto, AcceptInviteDto, QueryInvitesDto } from './dto';
import { CurrentUser, CurrentUserData, Public, RequirePermissions } from '../auth/decorators';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Controller()
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  // Organization-scoped routes
  @Get('organizations/:orgId/invites')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users:invite')
  findAll(@Param('orgId') orgId: string, @Query() query: QueryInvitesDto) {
    return this.inviteService.findAll(orgId, query);
  }

  @Post('organizations/:orgId/invites')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users:invite')
  create(
    @Param('orgId') orgId: string,
    @Body() createDto: CreateInviteDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.inviteService.create(orgId, createDto, user.id, user.name);
  }

  @Delete('organizations/:orgId/invites/:id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users:invite')
  cancel(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.inviteService.cancel(orgId, id, user.id);
  }

  @Post('organizations/:orgId/invites/:id/resend')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users:invite')
  resend(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.inviteService.resend(orgId, id, user.id);
  }

  // Public routes for accepting invites (no auth required)
  @Public()
  @Get('invites/:token')
  getByToken(@Param('token') token: string) {
    return this.inviteService.getByToken(token);
  }

  @Public()
  @Post('invites/accept')
  accept(@Body() acceptDto: AcceptInviteDto) {
    return this.inviteService.accept(acceptDto);
  }

  // User's pending invites
  @Get('users/:userId/invites')
  findUserInvites(
    @Param('userId') userId: string, 
    @Query('email') email: string,
    @CurrentUser() user: CurrentUserData
  ) {
    // Users can only query their own invites
    if (userId !== user.id) {
      return [];
    }
    return this.inviteService.findByEmail(email);
  }
}
