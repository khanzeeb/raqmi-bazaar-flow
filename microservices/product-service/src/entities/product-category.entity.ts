import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('product_categories')
@Index(['slug'], { unique: true })
@Index(['parentId'])
export class ProductCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 500, nullable: true })
  image: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string;

  @ManyToOne(() => ProductCategory, (cat) => cat.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent: ProductCategory;

  @OneToMany(() => ProductCategory, (cat) => cat.parent)
  children: ProductCategory[];

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({
    type: 'enum',
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
  })
  status: CategoryStatus;

  @Column({ name: 'meta_data', type: 'jsonb', nullable: true })
  metaData: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
