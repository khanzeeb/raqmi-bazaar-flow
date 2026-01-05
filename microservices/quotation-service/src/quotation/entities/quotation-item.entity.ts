import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Quotation } from './quotation.entity';

@Entity('quotation_items')
export class QuotationItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quotationId: string;

  @ManyToOne(() => Quotation, (quotation) => quotation.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quotationId' })
  quotation: Quotation;

  @Column()
  productId: string;

  @Column()
  productName: string;

  @Column({ nullable: true })
  productSku: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  lineTotal: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
