import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';

export enum VariantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('product_variants')
@Index(['productId'])
@Index(['sku'])
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100, nullable: true })
  sku: string;

  @Column({ length: 100, nullable: true })
  barcode: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'min_stock', type: 'int', default: 0 })
  minStock: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'jsonb', nullable: true })
  dimensions: { length: number; width: number; height: number };

  @Column({ type: 'jsonb', nullable: true })
  attributes: Record<string, any>;

  @Column({ length: 500, nullable: true })
  image: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({
    type: 'enum',
    enum: VariantStatus,
    default: VariantStatus.ACTIVE,
  })
  status: VariantStatus;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
