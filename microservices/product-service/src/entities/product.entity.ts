import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { ProductCategory } from './product-category.entity';
import { StockMovement } from './stock-movement.entity';

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
}

@Entity('products')
@Index(['sku'], { unique: true })
@Index(['status'])
@Index(['categoryId'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100, unique: true })
  sku: string;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string;

  @ManyToOne(() => ProductCategory, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: ProductCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'min_stock', type: 'int', default: 0 })
  minStock: number;

  @Column({ name: 'max_stock', type: 'int', default: 1000 })
  maxStock: number;

  @Column({ length: 500, nullable: true })
  image: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'short_description', length: 500, nullable: true })
  shortDescription: string;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status: ProductStatus;

  @Column({ length: 255, nullable: true })
  supplier: string;

  @Column({ length: 100, nullable: true })
  barcode: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'jsonb', nullable: true })
  dimensions: { length: number; width: number; height: number };

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @OneToMany(() => ProductVariant, (variant) => variant.product, { cascade: true })
  variants: ProductVariant[];

  @OneToMany(() => StockMovement, (movement) => movement.product)
  stockMovements: StockMovement[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
