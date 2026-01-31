import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Customer } from './customer.entity';

export enum CreditHistoryType {
  ADD = 'add',
  SUBTRACT = 'subtract',
  ADJUSTMENT = 'adjustment',
  PAYMENT = 'payment',
  REFUND = 'refund',
}

@Entity('customer_credit_history')
@Index(['customerId'])
@Index(['type'])
@Index(['createdAt'])
export class CustomerCreditHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'customer_id' })
  customerId: number;

  @ManyToOne(() => Customer, (customer) => customer.creditHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: CreditHistoryType,
  })
  type: CreditHistoryType;

  @Column({
    name: 'previous_credit',
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  previousCredit: number;

  @Column({
    name: 'new_credit',
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  newCredit: number;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ name: 'reference_id', nullable: true })
  referenceId: number;

  @Column({ name: 'reference_type', length: 100, nullable: true })
  referenceType: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
