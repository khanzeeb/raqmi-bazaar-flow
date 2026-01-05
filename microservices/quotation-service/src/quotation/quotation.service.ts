import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, LessThan, In } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { Quotation, QuotationStatus } from './entities/quotation.entity';
import { QuotationItem } from './entities/quotation-item.entity';
import { QuotationHistory, QuotationAction } from './entities/quotation-history.entity';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { QuotationQueryDto } from './dto/quotation-query.dto';

@Injectable()
export class QuotationService {
  constructor(
    @InjectRepository(Quotation)
    private quotationRepository: Repository<Quotation>,
    @InjectRepository(QuotationItem)
    private quotationItemRepository: Repository<QuotationItem>,
    @InjectRepository(QuotationHistory)
    private historyRepository: Repository<QuotationHistory>,
    @Inject('ORDER_SERVICE') private orderClient: ClientKafka,
    @Inject('NOTIFICATION_SERVICE') private notificationClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.orderClient.subscribeToResponseOf('quotation.converted');
    this.notificationClient.subscribeToResponseOf('quotation.sent');
    await this.orderClient.connect();
    await this.notificationClient.connect();
  }

  async create(createQuotationDto: CreateQuotationDto): Promise<Quotation> {
    const quotationNumber = await this.generateQuotationNumber();
    
    // Calculate totals
    const { subtotal, taxAmount, totalAmount } = this.calculateTotals(
      createQuotationDto.items,
      createQuotationDto.taxRate || 0,
      createQuotationDto.discount || 0,
    );

    const quotationDate = createQuotationDto.quotationDate 
      ? new Date(createQuotationDto.quotationDate) 
      : new Date();
    
    const validityDays = createQuotationDto.validityDays || 30;
    const validityDate = new Date(quotationDate);
    validityDate.setDate(validityDate.getDate() + validityDays);

    const quotation = this.quotationRepository.create({
      quotationNumber,
      customerId: createQuotationDto.customerId || `CUST-${Date.now()}`,
      customerName: createQuotationDto.customer.name,
      customerEmail: createQuotationDto.customer.email,
      customerPhone: createQuotationDto.customer.phone,
      customerType: createQuotationDto.customer.type || 'individual',
      quotationDate,
      validityDate,
      validityDays,
      subtotal,
      taxRate: createQuotationDto.taxRate || 0,
      taxAmount,
      discountAmount: createQuotationDto.discount || 0,
      totalAmount,
      currency: createQuotationDto.currency || 'SAR',
      notes: createQuotationDto.notes,
      termsConditions: createQuotationDto.termsConditions,
      status: QuotationStatus.DRAFT,
    });

    const savedQuotation = await this.quotationRepository.save(quotation);

    // Create items
    const items = createQuotationDto.items.map(item => {
      const lineTotal = this.calculateLineTotal(item);
      return this.quotationItemRepository.create({
        quotationId: savedQuotation.id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountAmount: item.discountAmount || 0,
        taxAmount: item.taxAmount || 0,
        lineTotal,
      });
    });

    await this.quotationItemRepository.save(items);

    // Add history entry
    await this.addHistory(savedQuotation.id, QuotationAction.CREATED, 'Quotation created');

    return this.findOne(savedQuotation.id);
  }

  async findAll(query: QuotationQueryDto) {
    const { page = 1, limit = 10, search, status, customerId, dateFrom, dateTo, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const whereConditions: any = {};

    if (status) {
      whereConditions.status = status;
    }

    if (customerId) {
      whereConditions.customerId = customerId;
    }

    if (dateFrom && dateTo) {
      whereConditions.quotationDate = Between(new Date(dateFrom), new Date(dateTo));
    }

    const queryBuilder = this.quotationRepository.createQueryBuilder('quotation')
      .leftJoinAndSelect('quotation.items', 'items')
      .leftJoinAndSelect('quotation.history', 'history');

    if (search) {
      queryBuilder.andWhere(
        '(quotation.quotationNumber ILIKE :search OR quotation.customerName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (status) {
      queryBuilder.andWhere('quotation.status = :status', { status });
    }

    if (customerId) {
      queryBuilder.andWhere('quotation.customerId = :customerId', { customerId });
    }

    if (dateFrom) {
      queryBuilder.andWhere('quotation.quotationDate >= :dateFrom', { dateFrom: new Date(dateFrom) });
    }

    if (dateTo) {
      queryBuilder.andWhere('quotation.quotationDate <= :dateTo', { dateTo: new Date(dateTo) });
    }

    queryBuilder
      .orderBy(`quotation.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data: data.map(q => this.mapToResponse(q)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Quotation> {
    const quotation = await this.quotationRepository.findOne({
      where: { id },
      relations: ['items', 'history'],
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    return quotation;
  }

  async update(id: string, updateQuotationDto: UpdateQuotationDto): Promise<Quotation> {
    const quotation = await this.findOne(id);

    if (quotation.status === QuotationStatus.CONVERTED || quotation.status === QuotationStatus.ACCEPTED) {
      throw new BadRequestException('Cannot modify converted or accepted quotation');
    }

    // Update quotation fields
    if (updateQuotationDto.customer) {
      quotation.customerName = updateQuotationDto.customer.name;
      quotation.customerEmail = updateQuotationDto.customer.email;
      quotation.customerPhone = updateQuotationDto.customer.phone;
      quotation.customerType = updateQuotationDto.customer.type || quotation.customerType;
    }

    if (updateQuotationDto.notes !== undefined) quotation.notes = updateQuotationDto.notes;
    if (updateQuotationDto.termsConditions !== undefined) quotation.termsConditions = updateQuotationDto.termsConditions;
    if (updateQuotationDto.validityDays !== undefined) {
      quotation.validityDays = updateQuotationDto.validityDays;
      const validityDate = new Date(quotation.quotationDate);
      validityDate.setDate(validityDate.getDate() + updateQuotationDto.validityDays);
      quotation.validityDate = validityDate;
    }

    // Update items if provided
    if (updateQuotationDto.items) {
      await this.quotationItemRepository.delete({ quotationId: id });

      const { subtotal, taxAmount, totalAmount } = this.calculateTotals(
        updateQuotationDto.items,
        updateQuotationDto.taxRate || quotation.taxRate,
        updateQuotationDto.discount || quotation.discountAmount,
      );

      quotation.subtotal = subtotal;
      quotation.taxAmount = taxAmount;
      quotation.totalAmount = totalAmount;

      const items = updateQuotationDto.items.map(item => {
        const lineTotal = this.calculateLineTotal(item);
        return this.quotationItemRepository.create({
          quotationId: id,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount || 0,
          taxAmount: item.taxAmount || 0,
          lineTotal,
        });
      });

      await this.quotationItemRepository.save(items);
    }

    await this.quotationRepository.save(quotation);
    await this.addHistory(id, QuotationAction.UPDATED, 'Quotation updated');

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const quotation = await this.findOne(id);
    
    if (quotation.status === QuotationStatus.CONVERTED) {
      throw new BadRequestException('Cannot delete converted quotation');
    }

    await this.quotationRepository.remove(quotation);
  }

  async send(id: string): Promise<Quotation> {
    const quotation = await this.findOne(id);

    if (quotation.status !== QuotationStatus.DRAFT) {
      throw new BadRequestException('Can only send draft quotations');
    }

    quotation.status = QuotationStatus.SENT;
    await this.quotationRepository.save(quotation);
    await this.addHistory(id, QuotationAction.SENT, 'Quotation sent to customer');

    // Emit notification event
    this.notificationClient.emit('quotation.sent', {
      quotationId: quotation.id,
      quotationNumber: quotation.quotationNumber,
      customerEmail: quotation.customerEmail,
      customerName: quotation.customerName,
      totalAmount: quotation.totalAmount,
    });

    return this.findOne(id);
  }

  async accept(id: string): Promise<Quotation> {
    const quotation = await this.findOne(id);

    if (quotation.status !== QuotationStatus.SENT) {
      throw new BadRequestException('Can only accept sent quotations');
    }

    quotation.status = QuotationStatus.ACCEPTED;
    await this.quotationRepository.save(quotation);
    await this.addHistory(id, QuotationAction.ACCEPTED, 'Quotation accepted by customer');

    return this.findOne(id);
  }

  async decline(id: string, reason?: string): Promise<Quotation> {
    const quotation = await this.findOne(id);

    if (quotation.status !== QuotationStatus.SENT) {
      throw new BadRequestException('Can only decline sent quotations');
    }

    quotation.status = QuotationStatus.DECLINED;
    quotation.declineReason = reason;
    await this.quotationRepository.save(quotation);
    await this.addHistory(id, QuotationAction.DECLINED, reason || 'Quotation declined by customer');

    return this.findOne(id);
  }

  async convertToSale(id: string): Promise<{ quotation: Quotation; saleOrderId: string }> {
    const quotation = await this.findOne(id);

    if (quotation.status !== QuotationStatus.ACCEPTED) {
      throw new BadRequestException('Can only convert accepted quotations to sales');
    }

    // Generate sale order number
    const saleOrderNumber = `SO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Date.now()).slice(-4)}`;

    // Emit event to order service to create sale
    const orderData = {
      quotationId: quotation.id,
      quotationNumber: quotation.quotationNumber,
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      customerEmail: quotation.customerEmail,
      customerPhone: quotation.customerPhone,
      items: quotation.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountAmount: item.discountAmount,
        taxAmount: item.taxAmount,
        lineTotal: item.lineTotal,
      })),
      subtotal: quotation.subtotal,
      taxAmount: quotation.taxAmount,
      discountAmount: quotation.discountAmount,
      totalAmount: quotation.totalAmount,
      currency: quotation.currency,
      notes: quotation.notes,
    };

    this.orderClient.emit('quotation.converted', orderData);

    // Update quotation status
    quotation.status = QuotationStatus.CONVERTED;
    quotation.convertedToSaleId = saleOrderNumber;
    await this.quotationRepository.save(quotation);
    await this.addHistory(id, QuotationAction.CONVERTED_TO_SALE, `Converted to sales order: ${saleOrderNumber}`);

    return {
      quotation: await this.findOne(id),
      saleOrderId: saleOrderNumber,
    };
  }

  async updateStatus(id: string, status: QuotationStatus): Promise<Quotation> {
    const quotation = await this.findOne(id);
    quotation.status = status;
    await this.quotationRepository.save(quotation);
    return this.findOne(id);
  }

  async getStats(filters?: { dateFrom?: string; dateTo?: string }) {
    const queryBuilder = this.quotationRepository.createQueryBuilder('quotation');

    if (filters?.dateFrom) {
      queryBuilder.andWhere('quotation.quotationDate >= :dateFrom', { dateFrom: new Date(filters.dateFrom) });
    }

    if (filters?.dateTo) {
      queryBuilder.andWhere('quotation.quotationDate <= :dateTo', { dateTo: new Date(filters.dateTo) });
    }

    const [total, draft, sent, accepted, declined, expired, converted] = await Promise.all([
      queryBuilder.clone().getCount(),
      queryBuilder.clone().andWhere('quotation.status = :status', { status: QuotationStatus.DRAFT }).getCount(),
      queryBuilder.clone().andWhere('quotation.status = :status', { status: QuotationStatus.SENT }).getCount(),
      queryBuilder.clone().andWhere('quotation.status = :status', { status: QuotationStatus.ACCEPTED }).getCount(),
      queryBuilder.clone().andWhere('quotation.status = :status', { status: QuotationStatus.DECLINED }).getCount(),
      queryBuilder.clone().andWhere('quotation.status = :status', { status: QuotationStatus.EXPIRED }).getCount(),
      queryBuilder.clone().andWhere('quotation.status = :status', { status: QuotationStatus.CONVERTED }).getCount(),
    ]);

    const totalValueResult = await queryBuilder.clone()
      .select('SUM(quotation.totalAmount)', 'totalValue')
      .getRawOne();

    const avgAmountResult = await queryBuilder.clone()
      .select('AVG(quotation.totalAmount)', 'avgAmount')
      .getRawOne();

    return {
      total_quotations: total,
      draft_count: draft,
      sent_count: sent,
      accepted_count: accepted,
      declined_count: declined,
      expired_count: expired,
      converted_count: converted,
      total_value: parseFloat(totalValueResult?.totalValue || 0),
      average_quotation_amount: parseFloat(avgAmountResult?.avgAmount || 0),
    };
  }

  async getExpired(): Promise<Quotation[]> {
    const today = new Date();
    return this.quotationRepository.find({
      where: {
        status: In([QuotationStatus.DRAFT, QuotationStatus.SENT]),
        validityDate: LessThan(today),
      },
      relations: ['items', 'history'],
    });
  }

  async processExpired(): Promise<number> {
    const expiredQuotations = await this.getExpired();
    let processedCount = 0;

    for (const quotation of expiredQuotations) {
      quotation.status = QuotationStatus.EXPIRED;
      await this.quotationRepository.save(quotation);
      await this.addHistory(quotation.id, QuotationAction.EXPIRED, 'Quotation expired due to validity date passed');
      processedCount++;
    }

    return processedCount;
  }

  async getReport(filters?: QuotationQueryDto) {
    const quotations = await this.findAll(filters || {});
    const stats = await this.getStats({
      dateFrom: filters?.dateFrom,
      dateTo: filters?.dateTo,
    });

    return {
      quotations: quotations.data,
      statistics: stats,
      summary: {
        total_quotations: quotations.total,
        date_range: {
          from: filters?.dateFrom,
          to: filters?.dateTo,
        },
      },
    };
  }

  private async generateQuotationNumber(): Promise<string> {
    const date = new Date();
    const prefix = `QT-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;

    const lastQuotation = await this.quotationRepository.findOne({
      where: { quotationNumber: Like(`${prefix}%`) },
      order: { quotationNumber: 'DESC' },
    });

    const sequence = lastQuotation
      ? parseInt(lastQuotation.quotationNumber.split('-').pop() || '0') + 1
      : 1;

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  private calculateLineTotal(item: { quantity: number; unitPrice: number; discountAmount?: number; taxAmount?: number }): number {
    return (item.quantity * item.unitPrice) - (item.discountAmount || 0) + (item.taxAmount || 0);
  }

  private calculateTotals(items: any[], taxRate: number, discount: number) {
    const subtotal = items.reduce((sum, item) => {
      return sum + this.calculateLineTotal(item);
    }, 0);

    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount - discount;

    return { subtotal, taxAmount, totalAmount };
  }

  private async addHistory(quotationId: string, action: QuotationAction, notes?: string) {
    const history = this.historyRepository.create({
      quotationId,
      action,
      notes,
    });
    await this.historyRepository.save(history);
  }

  private mapToResponse(quotation: Quotation) {
    return {
      id: quotation.id,
      quotationNumber: quotation.quotationNumber,
      customer: {
        name: quotation.customerName,
        email: quotation.customerEmail,
        phone: quotation.customerPhone,
        type: quotation.customerType,
      },
      customerId: quotation.customerId,
      quotationDate: quotation.quotationDate,
      validityDate: quotation.validityDate,
      validityDays: quotation.validityDays,
      expiryDate: quotation.validityDate,
      subtotal: Number(quotation.subtotal),
      taxRate: Number(quotation.taxRate),
      taxAmount: Number(quotation.taxAmount),
      discount: Number(quotation.discountAmount),
      total: Number(quotation.totalAmount),
      currency: quotation.currency,
      status: quotation.status,
      notes: quotation.notes,
      termsConditions: quotation.termsConditions,
      convertedToSaleId: quotation.convertedToSaleId,
      items: quotation.items?.map(item => ({
        id: item.id,
        name: item.productName,
        productId: item.productId,
        productSku: item.productSku,
        quantity: Number(item.quantity),
        price: Number(item.unitPrice),
        total: Number(item.lineTotal),
      })) || [],
      history: quotation.history?.map(h => ({
        id: h.id,
        action: h.action,
        timestamp: h.timestamp,
        notes: h.notes,
      })) || [],
      createdAt: quotation.createdAt,
      updatedAt: quotation.updatedAt,
    };
  }
}
