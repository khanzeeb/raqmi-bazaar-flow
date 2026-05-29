import {
  Injectable, Inject, Optional,
  NotFoundException, BadRequestException, ConflictException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PaymentRepository } from './payment.repository';
import { PaymentMapper } from './payment.mapper';
import {
  CreatePaymentDto, UpdatePaymentDto, PaymentFiltersDto,
  AllocatePaymentDto, CompletePaymentDto, PaymentStatus,
} from './dto';

const KAFKA_CLIENT = 'PAYMENT_KAFKA_CLIENT';

/** Orchestrates payment business logic with service-level validation (SRP, KISS). */
@Injectable()
export class PaymentService {
  constructor(
    private readonly repo: PaymentRepository,
    private readonly mapper: PaymentMapper,
    @Optional() @Inject(KAFKA_CLIENT) private readonly kafka?: ClientKafka,
  ) {}

  // ─── CRUD ───

  async getById(id: string) {
    this.assertUuid(id, 'id');
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundException('Payment not found');
    const allocations = await this.repo.findAllocationsByPaymentId(id);
    return {
      ...this.mapper.toDto(row),
      allocations: this.mapper.toDtoMany(allocations),
    };
  }

  async getAll(filters: PaymentFiltersDto) {
    this.validateDateRange(filters.startDate, filters.endDate);
    const result = await this.repo.findAll(filters);
    return { ...result, data: this.mapper.toDtoMany(result.data) };
  }

  async getCustomerPayments(customerId: string) {
    this.assertUuid(customerId, 'customerId');
    const rows = await this.repo.findByCustomerId(customerId);
    return this.mapper.toDtoMany(rows);
  }

  async create(dto: CreatePaymentDto) {
    this.validateCreate(dto);

    const paymentNumber = await this.repo.generatePaymentNumber();
    const row = this.mapper.createToRow(dto, paymentNumber);

    const created = await this.repo.create(row);
    return this.mapper.toDto(created);
  }

  async update(id: string, dto: UpdatePaymentDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Payment not found');
    if (existing.status === PaymentStatus.COMPLETED || existing.status === PaymentStatus.CANCELLED) {
      throw new ConflictException(`Cannot update a ${existing.status} payment`);
    }
    if (dto.amount !== undefined && dto.amount < Number(existing.allocated_amount)) {
      throw new BadRequestException('Amount cannot be lower than already-allocated amount');
    }

    const row = this.mapper.updateToRow(dto);
    if (dto.amount !== undefined) {
      row.unallocated_amount = dto.amount - Number(existing.allocated_amount);
    }
    const updated = await this.repo.update(id, row);
    return this.mapper.toDto(updated);
  }

  async remove(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Payment not found');
    if (Number(existing.allocated_amount) > 0) {
      throw new ConflictException('Cannot delete a payment with allocations');
    }
    return this.repo.delete(id);
  }

  // ─── Workflow ───

  async complete(id: string, dto: CompletePaymentDto = {}) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Payment not found');
    if (existing.status !== PaymentStatus.PENDING) {
      throw new ConflictException('Only pending payments can be completed');
    }

    const updated = await this.repo.update(id, {
      status: PaymentStatus.COMPLETED,
      approved_at: new Date(),
      approved_by: dto.approvedBy ?? null,
    });

    this.emit('payment.completed', {
      paymentId: updated.id,
      customerId: updated.customer_id,
      amount: Number(updated.amount),
    });

    return this.mapper.toDto(updated);
  }

  async cancel(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Payment not found');
    if (Number(existing.allocated_amount) > 0) {
      throw new ConflictException('Cannot cancel a payment with allocations');
    }
    if (existing.status === PaymentStatus.CANCELLED) {
      throw new ConflictException('Payment already cancelled');
    }
    const updated = await this.repo.update(id, { status: PaymentStatus.CANCELLED });
    return this.mapper.toDto(updated);
  }

  async allocate(dto: AllocatePaymentDto) {
    const payment = await this.repo.findById(dto.paymentId);
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new ConflictException('Only completed payments can be allocated');
    }

    const unallocated = Number(payment.unallocated_amount);
    if (dto.amount <= 0) throw new BadRequestException('Allocation amount must be positive');
    if (dto.amount > unallocated) {
      throw new BadRequestException(
        `Insufficient unallocated amount. Available: ${unallocated}`,
      );
    }

    const newAllocated = Number(payment.allocated_amount) + dto.amount;
    const newUnallocated = Number(payment.amount) - newAllocated;

    const updated = await this.repo.withinTransaction(async (trx) => {
      await this.repo.createAllocation(this.mapper.allocationToRow(dto), trx);
      return this.repo.update(
        dto.paymentId,
        { allocated_amount: newAllocated, unallocated_amount: newUnallocated },
        trx,
      );
    });

    this.emit('payment.allocated', {
      paymentId: updated.id,
      targetType: dto.targetType,
      targetId: dto.targetId,
      amount: dto.amount,
    });

    return this.mapper.toDto(updated);
  }

  // ─── Stats ───

  async getStats(startDate?: string, endDate?: string) {
    this.validateDateRange(startDate, endDate);
    return this.repo.getStats(startDate, endDate);
  }

  // ─── Validation helpers (DRY) ───

  private validateCreate(dto: CreatePaymentDto) {
    if (!dto.amount || dto.amount <= 0) {
      throw new BadRequestException('amount must be greater than 0');
    }
    if (Number.isNaN(new Date(dto.paymentDate).getTime())) {
      throw new BadRequestException('paymentDate is not a valid date');
    }
  }

  private validateDateRange(startDate?: string, endDate?: string) {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException('startDate must be before endDate');
    }
  }

  private assertUuid(value: string, field: string) {
    const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!value || !re.test(value)) {
      throw new BadRequestException(`${field} must be a valid UUID`);
    }
  }

  private emit(topic: string, payload: any) {
    try {
      this.kafka?.emit(topic, payload);
    } catch {
      // Kafka is optional in dev; swallow to keep the API responsive.
    }
  }
}

export { KAFKA_CLIENT };
