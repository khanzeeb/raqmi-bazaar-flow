import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AllocatePaymentDto } from './dto/allocate-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('payment.completed');
    this.kafkaClient.subscribeToResponseOf('payment.allocated');
    await this.kafkaClient.connect();
  }

  async create(createPaymentDto: CreatePaymentDto) {
    const paymentNumber = await this.generatePaymentNumber();

    const payment = await this.prisma.payment.create({
      data: {
        paymentNumber,
        customerId: createPaymentDto.customerId,
        customerName: createPaymentDto.customerName,
        amount: createPaymentDto.amount,
        unallocatedAmount: createPaymentDto.amount,
        paymentMethod: createPaymentDto.paymentMethod as any,
        paymentDate: new Date(createPaymentDto.paymentDate),
        reference: createPaymentDto.reference,
        notes: createPaymentDto.notes,
        chequeImagePath: createPaymentDto.chequeImagePath,
      },
      include: { allocations: true },
    });

    return payment;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, limit = 10, search, status, customerId, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { paymentNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = new Date(startDate);
      if (endDate) where.paymentDate.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: { allocations: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { allocations: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async complete(id: string, approvedBy?: string) {
    const payment = await this.findOne(id);

    if (payment.status !== 'PENDING') {
      throw new BadRequestException('Only pending payments can be completed');
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        approvedAt: new Date(),
        approvedBy,
      },
      include: { allocations: true },
    });

    this.kafkaClient.emit('payment.completed', {
      paymentId: payment.id,
      customerId: payment.customerId,
      amount: payment.amount,
    });

    return updatedPayment;
  }

  async allocate(allocateDto: AllocatePaymentDto) {
    const payment = await this.findOne(allocateDto.paymentId);

    if (payment.status !== 'COMPLETED') {
      throw new BadRequestException('Only completed payments can be allocated');
    }

    const unallocated = payment.unallocatedAmount.toNumber();
    if (allocateDto.amount > unallocated) {
      throw new BadRequestException(`Insufficient unallocated amount. Available: ${unallocated}`);
    }

    await this.prisma.paymentAllocation.create({
      data: {
        paymentId: allocateDto.paymentId,
        targetType: allocateDto.targetType,
        targetId: allocateDto.targetId,
        amount: allocateDto.amount,
      },
    });

    const newAllocated = payment.allocatedAmount.toNumber() + allocateDto.amount;
    const newUnallocated = payment.amount.toNumber() - newAllocated;

    const updatedPayment = await this.prisma.payment.update({
      where: { id: allocateDto.paymentId },
      data: {
        allocatedAmount: newAllocated,
        unallocatedAmount: newUnallocated,
      },
      include: { allocations: true },
    });

    // Emit event for invoice/order to update their payment status
    this.kafkaClient.emit('payment.allocated', {
      paymentId: payment.id,
      targetType: allocateDto.targetType,
      targetId: allocateDto.targetId,
      amount: allocateDto.amount,
      invoiceId: allocateDto.targetType === 'invoice' ? allocateDto.targetId : undefined,
      orderId: allocateDto.targetType === 'order' ? allocateDto.targetId : undefined,
    });

    return updatedPayment;
  }

  async cancel(id: string) {
    const payment = await this.findOne(id);

    if (payment.allocatedAmount.toNumber() > 0) {
      throw new BadRequestException('Cannot cancel payment with allocations');
    }

    return this.prisma.payment.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { allocations: true },
    });
  }

  async getStats() {
    const [totalPayments, pendingPayments, completedPayments, totalAmount, unallocatedAmount] = await Promise.all([
      this.prisma.payment.count(),
      this.prisma.payment.count({ where: { status: 'PENDING' } }),
      this.prisma.payment.count({ where: { status: 'COMPLETED' } }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' },
      }),
      this.prisma.payment.aggregate({
        _sum: { unallocatedAmount: true },
        where: { status: 'COMPLETED' },
      }),
    ]);

    return {
      totalPayments,
      pendingPayments,
      completedPayments,
      totalAmount: totalAmount._sum.amount || 0,
      unallocatedAmount: unallocatedAmount._sum.unallocatedAmount || 0,
    };
  }

  async getCustomerPayments(customerId: string) {
    return this.prisma.payment.findMany({
      where: { customerId },
      include: { allocations: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async generatePaymentNumber(): Promise<string> {
    const date = new Date();
    const prefix = `PAY-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const lastPayment = await this.prisma.payment.findFirst({
      where: { paymentNumber: { startsWith: prefix } },
      orderBy: { paymentNumber: 'desc' },
    });

    const sequence = lastPayment 
      ? parseInt(lastPayment.paymentNumber.split('-').pop() || '0') + 1 
      : 1;

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }
}
