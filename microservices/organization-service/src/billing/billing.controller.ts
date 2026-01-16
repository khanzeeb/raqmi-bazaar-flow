import { Controller, Get, Post, Put, Body, Param, Query, Headers } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { BillingService } from './billing.service';
import { UpdateSubscriptionDto, CreateBillingHistoryDto, QueryBillingHistoryDto } from './dto';

@Controller('organizations/:orgId/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('subscription')
  getSubscription(@Param('orgId') orgId: string) {
    return this.billingService.getSubscription(orgId);
  }

  @Get('plans')
  getAvailablePlans() {
    return this.billingService.getAvailablePlans();
  }

  @Put('subscription')
  updateSubscription(
    @Param('orgId') orgId: string,
    @Body() updateDto: UpdateSubscriptionDto,
    @Headers('x-user-id') userId: string
  ) {
    return this.billingService.updateSubscription(orgId, updateDto, userId);
  }

  @Post('subscription/cancel')
  cancelSubscription(
    @Param('orgId') orgId: string,
    @Headers('x-user-id') userId: string
  ) {
    return this.billingService.cancelSubscription(orgId, userId);
  }

  @Get('history')
  getBillingHistory(
    @Param('orgId') orgId: string,
    @Query() query: QueryBillingHistoryDto,
    @Headers('x-user-id') userId: string
  ) {
    return this.billingService.getBillingHistory(orgId, query, userId);
  }

  @Post('history')
  createBillingRecord(
    @Param('orgId') orgId: string,
    @Body() createDto: CreateBillingHistoryDto
  ) {
    return this.billingService.createBillingRecord(orgId, createDto);
  }

  @Get('usage')
  getUsageStats(
    @Param('orgId') orgId: string,
    @Headers('x-user-id') userId: string
  ) {
    return this.billingService.getUsageStats(orgId, userId);
  }

  // Kafka event handlers for payment webhooks
  @EventPattern('payment.subscription.updated')
  async handleSubscriptionUpdated(@Payload() data: { organizationId: string; planId: string; status: string }) {
    return this.billingService.handleExternalSubscriptionUpdate(data);
  }

  @EventPattern('payment.invoice.paid')
  async handleInvoicePaid(@Payload() data: { organizationId: string; invoiceId: string; amount: number }) {
    return this.billingService.handleInvoicePaid(data);
  }
}
