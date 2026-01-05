import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { QuotationItem } from './quotation-item.entity';
import { QuotationHistory } from './quotation-history.entity';

export enum QuotationStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  CONVERTED = 'converted',
}

@Entity('quotations')
export class Quotation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  quotationNumber: string;

  @Column()
  customerId: string;

  @Column()
  customerName: string;

  @Column({ nullable: true })
  customerEmail: string;

  @Column({ nullable: true })
  customerPhone: string;

  @Column({ type: 'varchar', default: 'individual' })
  customerType: 'individual' | 'business';

  @Column({ type: 'date' })
  quotationDate: Date;

  @Column({ type: 'date' })
  validityDate: Date;

  @Column({ type: 'int', default: 30 })
  validityDays: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ default: 'SAR' })
  currency: string;

  @Column({
    type: 'enum',
    enum: QuotationStatus,
    default: QuotationStatus.DRAFT,
  })
  status: QuotationStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  termsConditions: string;

  @Column({ nullable: true })
  convertedToSaleId: string;

  @Column({ nullable: true })
  declineReason: string;

  @OneToMany(() => QuotationItem, (item) => item.quotation, { cascade: true })
  items: QuotationItem[];

  @OneToMany(() => QuotationHistory, (history) => history.quotation, { cascade: true })
  history: QuotationHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
