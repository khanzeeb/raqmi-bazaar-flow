import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('suppliers')
@Index(['email'])
@Index(['status'])
export class Supplier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, nullable: true, unique: true })
  email: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ name: 'contact_person', length: 255, nullable: true })
  contactPerson: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  country: string;

  @Column({ name: 'tax_number', length: 100, nullable: true })
  taxNumber: string;

  @Column({
    type: 'enum',
    enum: SupplierStatus,
    default: SupplierStatus.ACTIVE,
  })
  status: SupplierStatus;

  @Column({
    name: 'credit_limit',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  creditLimit: number;

  @Column({ name: 'payment_terms', length: 100, nullable: true })
  paymentTerms: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
