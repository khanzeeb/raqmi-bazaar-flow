import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, DataSource } from 'typeorm';
import { Customer, CreditStatus, CustomerStatus } from '../../entities/customer.entity';
import { CustomerCreditHistory, CreditHistoryType } from '../../entities/customer-credit-history.entity';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  UpdateCreditDto,
  CustomerFiltersDto,
  CreditHistoryFiltersDto,
} from './dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: Date | null;
}

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(CustomerCreditHistory)
    private readonly creditHistoryRepository: Repository<CustomerCreditHistory>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createDto: CreateCustomerDto): Promise<Customer> {
    // Check for duplicate email
    if (createDto.email) {
      const existing = await this.findByEmail(createDto.email);
      if (existing) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    const customer = this.customerRepository.create({
      ...createDto,
      availableCredit: createDto.creditLimit || 0,
    });

    return await this.customerRepository.save(customer);
  }

  async findAll(filters: CustomerFiltersDto): Promise<PaginatedResult<Customer>> {
    const { search, status, type, creditStatus, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = filters;

    const where: FindOptionsWhere<Customer> = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (creditStatus) where.creditStatus = creditStatus;

    const queryBuilder = this.customerRepository.createQueryBuilder('customer');

    // Apply status filters
    if (status) queryBuilder.andWhere('customer.status = :status', { status });
    if (type) queryBuilder.andWhere('customer.type = :type', { type });
    if (creditStatus) queryBuilder.andWhere('customer.credit_status = :creditStatus', { creditStatus });

    // Apply search
    if (search) {
      queryBuilder.andWhere(
        '(customer.name ILIKE :search OR customer.email ILIKE :search OR customer.phone ILIKE :search OR customer.company ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply sorting with snake_case column mapping
    const sortColumn = this.mapToSnakeCase(sortBy);
    queryBuilder.orderBy(`customer.${sortColumn}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return await this.customerRepository.findOne({ where: { email } });
  }

  async update(id: number, updateDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findById(id);

    // Check for duplicate email if updating
    if (updateDto.email && updateDto.email !== customer.email) {
      const existing = await this.findByEmail(updateDto.email);
      if (existing) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    // If credit limit is updated, recalculate available credit
    if (updateDto.creditLimit !== undefined) {
      updateDto['availableCredit'] = Math.max(0, updateDto.creditLimit - customer.usedCredit);
    }

    Object.assign(customer, updateDto);
    return await this.customerRepository.save(customer);
  }

  async delete(id: number): Promise<boolean> {
    const customer = await this.findById(id);
    await this.customerRepository.remove(customer);
    return true;
  }

  async updateCredit(id: number, dto: UpdateCreditDto): Promise<Customer> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const customer = await queryRunner.manager.findOne(Customer, { where: { id } });
      if (!customer) {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }

      const previousCredit = Number(customer.usedCredit);
      let newUsedCredit: number;

      if (dto.type === 'add') {
        newUsedCredit = previousCredit + dto.amount;
      } else {
        newUsedCredit = Math.max(0, previousCredit - dto.amount);
      }

      const newAvailableCredit = Math.max(0, Number(customer.creditLimit) - newUsedCredit);

      // Update customer credit
      await queryRunner.manager.update(Customer, id, {
        usedCredit: newUsedCredit,
        availableCredit: newAvailableCredit,
      });

      // Record credit history
      const historyEntry = this.creditHistoryRepository.create({
        customerId: id,
        amount: dto.amount,
        type: dto.type === 'add' ? CreditHistoryType.ADD : CreditHistoryType.SUBTRACT,
        previousCredit,
        newCredit: newUsedCredit,
        reason: dto.reason,
        referenceType: 'manual_adjustment',
      });

      await queryRunner.manager.save(historyEntry);
      await queryRunner.commitTransaction();

      return await this.findById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getCreditHistory(customerId: number, filters: CreditHistoryFiltersDto): Promise<PaginatedResult<CustomerCreditHistory>> {
    await this.findById(customerId); // Verify customer exists

    const { type, page = 1, limit = 50 } = filters;

    const queryBuilder = this.creditHistoryRepository
      .createQueryBuilder('history')
      .where('history.customer_id = :customerId', { customerId })
      .orderBy('history.created_at', 'DESC');

    if (type) {
      queryBuilder.andWhere('history.type = :type', { type });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCustomerStats(customerId: number): Promise<CustomerStats> {
    await this.findById(customerId); // Verify customer exists

    // Query sales table for customer stats
    const stats = await this.dataSource.query(
      `SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_spent,
        COALESCE(AVG(total_amount), 0) as average_order_value,
        MAX(sale_date) as last_order_date
      FROM sales 
      WHERE customer_id = $1`,
      [customerId],
    );

    const result = stats[0] || {};

    return {
      totalOrders: parseInt(result.total_orders) || 0,
      totalSpent: parseFloat(result.total_spent) || 0,
      averageOrderValue: parseFloat(result.average_order_value) || 0,
      lastOrderDate: result.last_order_date || null,
    };
  }

  async blockCustomer(id: number, reason?: string): Promise<Customer> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const customer = await this.findById(id);

      await queryRunner.manager.update(Customer, id, {
        status: CustomerStatus.BLOCKED,
        creditStatus: CreditStatus.BLOCKED,
      });

      // Record status change in history
      if (reason) {
        const historyEntry = this.creditHistoryRepository.create({
          customerId: id,
          amount: 0,
          type: CreditHistoryType.ADJUSTMENT,
          previousCredit: Number(customer.usedCredit),
          newCredit: Number(customer.usedCredit),
          reason: `Customer blocked: ${reason}`,
          referenceType: 'status_change',
        });
        await queryRunner.manager.save(historyEntry);
      }

      await queryRunner.commitTransaction();
      return await this.findById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async unblockCustomer(id: number, reason?: string): Promise<Customer> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const customer = await this.findById(id);
      const newCreditStatus = this.calculateCreditStatus(customer);

      await queryRunner.manager.update(Customer, id, {
        status: CustomerStatus.ACTIVE,
        creditStatus: newCreditStatus,
      });

      // Record status change in history
      if (reason) {
        const historyEntry = this.creditHistoryRepository.create({
          customerId: id,
          amount: 0,
          type: CreditHistoryType.ADJUSTMENT,
          previousCredit: Number(customer.usedCredit),
          newCredit: Number(customer.usedCredit),
          reason: `Customer unblocked: ${reason}`,
          referenceType: 'status_change',
        });
        await queryRunner.manager.save(historyEntry);
      }

      await queryRunner.commitTransaction();
      return await this.findById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private calculateCreditStatus(customer: Customer): CreditStatus {
    const overdueAmount = Number(customer.overdueAmount);
    const creditLimit = Number(customer.creditLimit);
    const usedCredit = Number(customer.usedCredit);

    if (overdueAmount > 0) {
      return CreditStatus.BLOCKED;
    }

    if (creditLimit > 0) {
      const utilizationRate = (usedCredit / creditLimit) * 100;
      if (utilizationRate >= 90) {
        return CreditStatus.BLOCKED;
      } else if (utilizationRate >= 75) {
        return CreditStatus.WARNING;
      }
    }

    return CreditStatus.GOOD;
  }

  private mapToSnakeCase(camelCase: string): string {
    const mapping: Record<string, string> = {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      creditLimit: 'credit_limit',
      usedCredit: 'used_credit',
      availableCredit: 'available_credit',
      overdueAmount: 'overdue_amount',
      totalOutstanding: 'total_outstanding',
      creditStatus: 'credit_status',
      paymentTerms: 'payment_terms',
      preferredLanguage: 'preferred_language',
      lastPaymentDate: 'last_payment_date',
      taxNumber: 'tax_number',
    };
    return mapping[camelCase] || camelCase;
  }
}
