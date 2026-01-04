import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Quotation } from './quotation.entity';

export enum QuotationAction {
  CREATED = 'created',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  CONVERTED_TO_SALE = 'converted_to_sale',
  UPDATED = 'updated',
}

@Entity('quotation_history')
export class QuotationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quotationId: string;

  @ManyToOne(() => Quotation, (quotation) => quotation.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quotationId' })
  quotation: Quotation;

  @Column({
    type: 'enum',
    enum: QuotationAction,
  })
  action: QuotationAction;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  performedBy: string;

  @CreateDateColumn()
  timestamp: Date;
}
