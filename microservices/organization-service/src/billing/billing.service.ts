import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSubscriptionDto, CreateBillingHistoryDto, QueryBillingHistoryDto, AVAILABLE_PLANS } from './dto';

@Injectable()
export class BillingService {
  constructor(
    private prisma: PrismaService,
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
  ) {}

  async getSubscription(organizationId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const plan = AVAILABLE_PLANS.find((p) => p.id === subscription.planId);

    return {
      ...subscription,
      planDetails: plan,
      usagePercentage: {
        users: Math.round((subscription.usedUsers / subscription.maxUsers) * 100),
        storage: Math.round((subscription.usedStorage / subscription.maxStorage) * 100),
      },
    };
  }

  getAvailablePlans() {
    return AVAILABLE_PLANS;
  }

  async updateSubscription(organizationId: string, updateDto: UpdateSubscriptionDto, userId: string) {
    await this.requirePermission(organizationId, userId, 'org:billing');

    const currentSub = await this.prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (!currentSub) {
      throw new NotFoundException('Subscription not found');
    }

    // Validate plan exists
    const newPlan = AVAILABLE_PLANS.find((p) => p.id === updateDto.planId);
    if (!newPlan) {
      throw new BadRequestException('Invalid plan');
    }

    // Check if downgrading would exceed limits
    const memberCount = await this.prisma.organizationMember.count({
      where: { organizationId, isActive: true },
    });

    if (newPlan.limits.maxUsers < memberCount) {
      throw new BadRequestException(
        `Cannot downgrade: You have ${memberCount} active members, but ${newPlan.name} only allows ${newPlan.limits.maxUsers}`
      );
    }

    // Calculate new period
    const billingCycle = updateDto.billingCycle || currentSub.billingCycle;
    const periodDays = billingCycle === 'YEARLY' ? 365 : 30;
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000);

    const updated = await this.prisma.subscription.update({
      where: { organizationId },
      data: {
        planId: updateDto.planId,
        planName: updateDto.planName,
        billingCycle,
        amount: updateDto.amount,
        maxUsers: updateDto.maxUsers || newPlan.limits.maxUsers,
        maxStorage: updateDto.maxStorage || newPlan.limits.maxStorage,
        externalId: updateDto.externalId,
        currentPeriodStart,
        currentPeriodEnd,
      },
    });

    // Emit event
    this.kafkaClient.emit('organization.subscription.updated', {
      organizationId,
      planId: updateDto.planId,
      updatedBy: userId,
    });

    return updated;
  }

  async cancelSubscription(organizationId: string, userId: string) {
    await this.requirePermission(organizationId, userId, 'org:billing');

    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status === 'CANCELLED') {
      throw new BadRequestException('Subscription is already cancelled');
    }

    await this.prisma.subscription.update({
      where: { organizationId },
      data: { status: 'CANCELLED' },
    });

    // Emit event
    this.kafkaClient.emit('organization.subscription.cancelled', {
      organizationId,
      cancelledBy: userId,
    });

    return { success: true, message: 'Subscription cancelled. Access continues until end of billing period.' };
  }

  async getBillingHistory(organizationId: string, query: QueryBillingHistoryDto, userId: string) {
    await this.requirePermission(organizationId, userId, 'org:billing');

    const where: any = { organizationId };

    if (query.status) {
      where.status = query.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.billingHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit || 20,
        skip: query.offset || 0,
      }),
      this.prisma.billingHistory.count({ where }),
    ]);

    return { data, total };
  }

  async createBillingRecord(organizationId: string, createDto: CreateBillingHistoryDto) {
    return this.prisma.billingHistory.create({
      data: {
        organizationId,
        invoiceNumber: createDto.invoiceNumber,
        description: createDto.description,
        amount: createDto.amount,
        currency: createDto.currency || 'USD',
        periodStart: new Date(createDto.periodStart),
        periodEnd: new Date(createDto.periodEnd),
        externalId: createDto.externalId,
        invoiceUrl: createDto.invoiceUrl,
      },
    });
  }

  async getUsageStats(organizationId: string, userId: string) {
    await this.requirePermission(organizationId, userId, 'org:billing');

    const [subscription, memberCount, inviteCount] = await Promise.all([
      this.prisma.subscription.findUnique({ where: { organizationId } }),
      this.prisma.organizationMember.count({ where: { organizationId, isActive: true } }),
      this.prisma.organizationInvite.count({ where: { organizationId, status: 'PENDING' } }),
    ]);

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return {
      users: {
        used: memberCount,
        limit: subscription.maxUsers,
        pending: inviteCount,
        percentage: Math.round((memberCount / subscription.maxUsers) * 100),
      },
      storage: {
        used: subscription.usedStorage,
        limit: subscription.maxStorage,
        percentage: Math.round((subscription.usedStorage / subscription.maxStorage) * 100),
      },
      plan: {
        id: subscription.planId,
        name: subscription.planName,
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        amount: subscription.amount,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
    };
  }

  async handleExternalSubscriptionUpdate(data: { organizationId: string; planId: string; status: string }) {
    const plan = AVAILABLE_PLANS.find((p) => p.id === data.planId);
    if (!plan) return;

    await this.prisma.subscription.update({
      where: { organizationId: data.organizationId },
      data: {
        planId: data.planId,
        planName: plan.name,
        status: data.status as any,
        maxUsers: plan.limits.maxUsers,
        maxStorage: plan.limits.maxStorage,
      },
    });
  }

  async handleInvoicePaid(data: { organizationId: string; invoiceId: string; amount: number }) {
    // Update any pending billing history record
    await this.prisma.billingHistory.updateMany({
      where: { organizationId: data.organizationId, externalId: data.invoiceId },
      data: { status: 'PAID', paidAt: new Date() },
    });
  }

  private async requirePermission(organizationId: string, userId: string, permission: string) {
    const member = await this.prisma.organizationMember.findFirst({
      where: { organizationId, userId, isActive: true },
      include: { role: true },
    });

    if (!member) {
      throw new ForbiddenException('Not a member of this organization');
    }

    const permissions = member.role.permissions as string[];
    if (!permissions.includes(permission)) {
      throw new ForbiddenException(`Missing permission: ${permission}`);
    }
  }
}
