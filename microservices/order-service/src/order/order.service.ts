import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('order.created');
    this.kafkaClient.subscribeToResponseOf('order.updated');
    await this.kafkaClient.connect();
  }

  async create(createOrderDto: CreateOrderDto) {
    const orderNumber = await this.generateOrderNumber();
    
    const subtotal = createOrderDto.items.reduce((sum, item) => {
      const lineTotal = item.quantity * item.unitPrice - (item.discountAmount || 0) + (item.taxAmount || 0);
      return sum + lineTotal;
    }, 0);

    const totalAmount = subtotal - (createOrderDto.discountAmount || 0) + (createOrderDto.taxAmount || 0);

    const order = await this.prisma.salesOrder.create({
      data: {
        orderNumber,
        customerId: createOrderDto.customerId,
        customerName: createOrderDto.customerName,
        orderDate: new Date(createOrderDto.orderDate),
        dueDate: new Date(createOrderDto.dueDate),
        subtotal,
        taxAmount: createOrderDto.taxAmount || 0,
        discountAmount: createOrderDto.discountAmount || 0,
        totalAmount,
        balanceAmount: totalAmount,
        currency: createOrderDto.currency || 'USD',
        notes: createOrderDto.notes,
        termsConditions: createOrderDto.termsConditions,
        items: {
          create: createOrderDto.items.map(item => ({
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
      include: { items: true },
    });

    // Emit Kafka event for order creation
    this.kafkaClient.emit('order.created', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      totalAmount: order.totalAmount,
      items: order.items,
    });

    return order;
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
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate);
      if (endDate) where.orderDate.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.salesOrder.findMany({
        where,
        skip,
        take: limit,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.salesOrder.count({ where }),
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
    const order = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const existingOrder = await this.findOne(id);

    const updateData: any = { ...updateOrderDto };
    delete updateData.items;

    if (updateOrderDto.items) {
      // Delete existing items and create new ones
      await this.prisma.salesOrderItem.deleteMany({
        where: { orderId: id },
      });

      const subtotal = updateOrderDto.items.reduce((sum, item) => {
        const lineTotal = item.quantity * item.unitPrice - (item.discountAmount || 0) + (item.taxAmount || 0);
        return sum + lineTotal;
      }, 0);

      updateData.subtotal = subtotal;
      updateData.totalAmount = subtotal - (updateOrderDto.discountAmount || existingOrder.discountAmount.toNumber()) + 
                               (updateOrderDto.taxAmount || existingOrder.taxAmount.toNumber());
      updateData.balanceAmount = updateData.totalAmount - existingOrder.paidAmount.toNumber();
    }

    const order = await this.prisma.salesOrder.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateOrderDto.items && {
          items: {
            create: updateOrderDto.items.map(item => ({
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
      include: { items: true },
    });

    this.kafkaClient.emit('order.updated', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
    });

    return order;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.salesOrder.delete({ where: { id } });
    return { message: 'Order deleted successfully' };
  }

  async getStats() {
    const [totalOrders, pendingOrders, completedOrders, revenue] = await Promise.all([
      this.prisma.salesOrder.count(),
      this.prisma.salesOrder.count({ where: { status: 'PENDING' } }),
      this.prisma.salesOrder.count({ where: { status: 'COMPLETED' } }),
      this.prisma.salesOrder.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: 'CANCELLED' } },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: revenue._sum.totalAmount || 0,
    };
  }

  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const prefix = `SO-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const lastOrder = await this.prisma.salesOrder.findFirst({
      where: { orderNumber: { startsWith: prefix } },
      orderBy: { orderNumber: 'desc' },
    });

    const sequence = lastOrder 
      ? parseInt(lastOrder.orderNumber.split('-').pop() || '0') + 1 
      : 1;

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }
}
