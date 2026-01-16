import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { BillingService } from './billing.service';
import { UpdateSubscriptionDto, CreateBillingHistoryDto, QueryBillingHistoryDto } from './dto';
import { CurrentUser, CurrentUserData, Public, RequirePermissions } from '../auth/decorators';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Controller('organizations/:orgId/billing')
@UseGuards(PermissionsGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('subscription')
  @RequirePermissions('org:billing')
  getSubscription(@Param('orgId') orgId: string) {
    return this.billingService.getSubscription(orgId);
  }

  @Public()
  @Get('plans')
  getAvailablePlans() {
    return this.billingService.getAvailablePlans();
  }

  @Put('subscription')
  @RequirePermissions('org:billing')
  updateSubscription(
    @Param('orgId') orgId: string,
    @Body() updateDto: UpdateSubscriptionDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.billingService.updateSubscription(orgId, updateDto, user.id);
  }

  @Post('subscription/cancel')
  @RequirePermissions('org:billing')
  cancelSubscription(
    @Param('orgId') orgId: string,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.billingService.cancelSubscription(orgId, user.id);
  }

  @Get('history')
  @RequirePermissions('org:billing')
  getBillingHistory(
    @Param('orgId') orgId: string,
    @Query() query: QueryBillingHistoryDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.billingService.getBillingHistory(orgId, query, user.id);
  }

  @Post('history')
  @RequirePermissions('org:billing')
  createBillingRecord(
    @Param('orgId') orgId: string,
    @Body() createDto: CreateBillingHistoryDto
  ) {
    return this.billingService.createBillingRecord(orgId, createDto);
  }

  @Get('usage')
  @RequirePermissions('org:billing')
  getUsageStats(
    @Param('orgId') orgId: string,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.billingService.getUsageStats(orgId, user.id);
  }

  // Kafka event handlers for payment webhooks (internal)
  @EventPattern('payment.subscription.updated')
  async handleSubscriptionUpdated(@Payload() data: { organizationId: string; planId: string; status: string }) {
    return this.billingService.handleExternalSubscriptionUpdate(data);
  }

  @EventPattern('payment.invoice.paid')
  async handleInvoicePaid(@Payload() data: { organizationId: string; invoiceId: string; amount: number }) {
    return this.billingService.handleInvoicePaid(data);
  }
}
