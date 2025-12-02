import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(
    private prisma: PrismaService,
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('invoice.created');
    this.kafkaClient.subscribeToResponseOf('invoice.sent');
    await this.kafkaClient.connect();
  }

  async create(createInvoiceDto: CreateInvoiceDto) {
    const invoiceNumber = await this.generateInvoiceNumber();
    
    const subtotal = createInvoiceDto.items.reduce((sum, item) => {
      const lineTotal = item.quantity * item.unitPrice - (item.discountAmount || 0) + (item.taxAmount || 0);
      return sum + lineTotal;
    }, 0);

    const totalAmount = subtotal - (createInvoiceDto.discountAmount || 0) + (createInvoiceDto.taxAmount || 0);

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: createInvoiceDto.orderId,
        customerId: createInvoiceDto.customerId,
        customerName: createInvoiceDto.customerName,
        customerEmail: createInvoiceDto.customerEmail,
        invoiceDate: new Date(createInvoiceDto.invoiceDate),
        dueDate: new Date(createInvoiceDto.dueDate),
        subtotal,
        taxAmount: createInvoiceDto.taxAmount || 0,
        discountAmount: createInvoiceDto.discountAmount || 0,
        totalAmount,
        balanceAmount: totalAmount,
        currency: createInvoiceDto.currency || 'USD',
        notes: createInvoiceDto.notes,
        termsConditions: createInvoiceDto.termsConditions,
        items: {
          create: createInvoiceDto.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            productSku: item.productSku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountAmount: item.discountAmount || 0,
            taxAmount: item.taxAmount || 0,
            lineTotal: item.quantity * item.unitPrice - (item.discountAmount || 0) + (item.taxAmount || 0),
            description: item.description,
          })),
        },
      },
      include: { items: true, payments: true },
    });

    this.kafkaClient.emit('invoice.created', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      orderId: invoice.orderId,
      totalAmount: invoice.totalAmount,
    });

    return invoice;
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
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (startDate || endDate) {
      where.invoiceDate = {};
      if (startDate) where.invoiceDate.gte = new Date(startDate);
      if (endDate) where.invoiceDate.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        include: { items: true, payments: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where }),
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
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true, payments: true },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    const existingInvoice = await this.findOne(id);

    const updateData: any = { ...updateInvoiceDto };
    delete updateData.items;

    if (updateInvoiceDto.items) {
      await this.prisma.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });

      const subtotal = updateInvoiceDto.items.reduce((sum, item) => {
        const lineTotal = item.quantity * item.unitPrice - (item.discountAmount || 0) + (item.taxAmount || 0);
        return sum + lineTotal;
      }, 0);

      updateData.subtotal = subtotal;
      updateData.totalAmount = subtotal - (updateInvoiceDto.discountAmount || existingInvoice.discountAmount.toNumber()) + 
                               (updateInvoiceDto.taxAmount || existingInvoice.taxAmount.toNumber());
      updateData.balanceAmount = updateData.totalAmount - existingInvoice.paidAmount.toNumber();
    }

    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateInvoiceDto.items && {
          items: {
            create: updateInvoiceDto.items.map(item => ({
              productId: item.productId,
              productName: item.productName,
              productSku: item.productSku,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountAmount: item.discountAmount || 0,
              taxAmount: item.taxAmount || 0,
              lineTotal: item.quantity * item.unitPrice - (item.discountAmount || 0) + (item.taxAmount || 0),
              description: item.description,
            })),
          },
        }),
      },
      include: { items: true, payments: true },
    });

    return invoice;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.invoice.delete({ where: { id } });
    return { message: 'Invoice deleted successfully' };
  }

  async sendInvoice(id: string) {
    const invoice = await this.findOne(id);
    
    const updatedInvoice = await this.prisma.invoice.update({
      where: { id },
      data: { status: 'SENT' },
      include: { items: true, payments: true },
    });

    this.kafkaClient.emit('invoice.sent', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerEmail: invoice.customerEmail,
      totalAmount: invoice.totalAmount,
    });

    return updatedInvoice;
  }

  async applyPayment(invoiceId: string, paymentId: string, amount: number) {
    const invoice = await this.findOne(invoiceId);
    
    await this.prisma.invoicePayment.create({
      data: {
        invoiceId,
        paymentId,
        amount,
      },
    });

    const newPaidAmount = invoice.paidAmount.toNumber() + amount;
    const newBalance = invoice.totalAmount.toNumber() - newPaidAmount;

    let status = invoice.status;
    let paymentStatus = 'PARTIALLY_PAID';
    
    if (newBalance <= 0) {
      status = 'PAID';
      paymentStatus = 'PAID';
    }

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: newPaidAmount,
        balanceAmount: Math.max(0, newBalance),
        status: status as any,
        paymentStatus: paymentStatus as any,
      },
      include: { items: true, payments: true },
    });
  }

  async getStats() {
    const [totalInvoices, pendingInvoices, paidInvoices, overdueInvoices, totalRevenue, outstandingAmount] = await Promise.all([
      this.prisma.invoice.count(),
      this.prisma.invoice.count({ where: { status: { in: ['DRAFT', 'SENT'] } } }),
      this.prisma.invoice.count({ where: { status: 'PAID' } }),
      this.prisma.invoice.count({ where: { status: 'OVERDUE' } }),
      this.prisma.invoice.aggregate({
        _sum: { paidAmount: true },
      }),
      this.prisma.invoice.aggregate({
        _sum: { balanceAmount: true },
        where: { status: { notIn: ['PAID', 'CANCELLED'] } },
      }),
    ]);

    return {
      totalInvoices,
      pendingInvoices,
      paidInvoices,
      overdueInvoices,
      totalRevenue: totalRevenue._sum.paidAmount || 0,
      outstandingAmount: outstandingAmount._sum.balanceAmount || 0,
    };
  }

  private async generateInvoiceNumber(): Promise<string> {
    const date = new Date();
    const prefix = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: { invoiceNumber: { startsWith: prefix } },
      orderBy: { invoiceNumber: 'desc' },
    });

    const sequence = lastInvoice 
      ? parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0') + 1 
      : 1;

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }
}
