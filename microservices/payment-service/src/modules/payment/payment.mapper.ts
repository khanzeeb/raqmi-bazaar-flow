import { Injectable } from '@nestjs/common';
import { BaseMapper } from '../../common/base.mapper';
import { CreatePaymentDto, UpdatePaymentDto, AllocatePaymentDto } from './dto';

/**
 * Domain-specific payment mapper.
 * Extends BaseMapper for generic camelCase ↔ snake_case conversion (DRY)
 * and adds payment-specific row builders (SRP).
 */
@Injectable()
export class PaymentMapper extends BaseMapper {
  createToRow(dto: CreatePaymentDto, paymentNumber: string): Record<string, any> {
    return {
      ...this.toRow(dto),
      payment_number: paymentNumber,
      payment_date: dto.paymentDate,
      allocated_amount: 0,
      unallocated_amount: dto.amount,
      status: 'pending',
    };
  }

  updateToRow(dto: UpdatePaymentDto): Record<string, any> {
    return this.toRow(dto);
  }

  allocationToRow(dto: AllocatePaymentDto): Record<string, any> {
    return {
      payment_id: dto.paymentId,
      target_type: dto.targetType,
      target_id: dto.targetId,
      amount: dto.amount,
    };
  }
}
