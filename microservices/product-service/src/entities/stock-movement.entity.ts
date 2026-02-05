import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';

export enum MovementType {
  PURCHASE = 'purchase',
  SALE = 'sale',
  ADJUSTMENT = 'adjustment',
  RETURN = 'return',
  TRANSFER = 'transfer',
  DAMAGED = 'damaged',
  EXPIRED = 'expired',
}

@Entity('stock_movements')
@Index(['productId'])
@Index(['productVariantId'])
@Index(['type'])
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid', nullable: true })
  productId: string;

  @ManyToOne(() => Product, (product) => product.stockMovements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_variant_id', type: 'uuid', nullable: true })
  productVariantId: string;

  @ManyToOne(() => ProductVariant, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_variant_id' })
  productVariant: ProductVariant;

  @Column({ type: 'enum', enum: MovementType })
  type: MovementType;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId: string;

  @Column({ name: 'reference_type', length: 100, nullable: true })
  referenceType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
