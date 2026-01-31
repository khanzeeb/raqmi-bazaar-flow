import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { CustomerCreditHistory } from './customer-credit-history.entity';

export enum CustomerType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
}

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
}

export enum CreditStatus {
  GOOD = 'good',
  WARNING = 'warning',
  BLOCKED = 'blocked',
}

export enum PaymentTerms {
  IMMEDIATE = 'immediate',
  NET_7 = 'net_7',
  NET_15 = 'net_15',
  NET_30 = 'net_30',
  NET_45 = 'net_45',
  NET_60 = 'net_60',
  NET_90 = 'net_90',
}

export enum PreferredLanguage {
  EN = 'en',
  AR = 'ar',
}

@Entity('customers')
@Index(['email'])
@Index(['status'])
@Index(['creditStatus'])
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, nullable: true, unique: true })
  email: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  company: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'tax_number', length: 100, nullable: true })
  taxNumber: string;

  @Column({
    type: 'enum',
    enum: CustomerType,
    default: CustomerType.INDIVIDUAL,
  })
  type: CustomerType;

  @Column({
    type: 'enum',
    enum: CustomerStatus,
    default: CustomerStatus.ACTIVE,
  })
  status: CustomerStatus;

  @Column({
    name: 'credit_limit',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  creditLimit: number;

  @Column({
    name: 'used_credit',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  usedCredit: number;

  @Column({
    name: 'available_credit',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  availableCredit: number;

  @Column({
    name: 'overdue_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  overdueAmount: number;

  @Column({
    name: 'total_outstanding',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  totalOutstanding: number;

  @Column({
    name: 'credit_status',
    type: 'enum',
    enum: CreditStatus,
    default: CreditStatus.GOOD,
  })
  creditStatus: CreditStatus;

  @Column({
    name: 'payment_terms',
    type: 'enum',
    enum: PaymentTerms,
    default: PaymentTerms.NET_30,
  })
  paymentTerms: PaymentTerms;

  @Column({
    name: 'preferred_language',
    type: 'enum',
    enum: PreferredLanguage,
    default: PreferredLanguage.EN,
  })
  preferredLanguage: PreferredLanguage;

  @Column({ name: 'last_payment_date', type: 'timestamp', nullable: true })
  lastPaymentDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => CustomerCreditHistory, (history) => history.customer)
  creditHistory: CustomerCreditHistory[];
}
