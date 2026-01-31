import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Supplier } from '../../entities/supplier.entity';
import {
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierFiltersDto,
  SupplierPurchasesFiltersDto,
} from './dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SupplierStats {
  totalSuppliers: number;
  activeCount: number;
  inactiveCount: number;
  totalCreditLimit: number;
}

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createDto: CreateSupplierDto): Promise<Supplier> {
    // Check for duplicate email
    if (createDto.email) {
      const existing = await this.findByEmail(createDto.email);
      if (existing) {
        throw new ConflictException('Supplier with this email already exists');
      }
    }

    const supplier = this.supplierRepository.create(createDto);
    return await this.supplierRepository.save(supplier);
  }

  async findAll(filters: SupplierFiltersDto): Promise<PaginatedResult<Supplier>> {
    const { search, status, country, page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = filters;

    const queryBuilder = this.supplierRepository.createQueryBuilder('supplier');

    // Apply status filter
    if (status) {
      queryBuilder.andWhere('supplier.status = :status', { status });
    }

    // Apply country filter
    if (country) {
      queryBuilder.andWhere('supplier.country = :country', { country });
    }

    // Apply search
    if (search) {
      queryBuilder.andWhere(
        '(supplier.name ILIKE :search OR supplier.email ILIKE :search OR supplier.contact_person ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply sorting with snake_case column mapping
    const sortColumn = this.mapToSnakeCase(sortBy);
    queryBuilder.orderBy(`supplier.${sortColumn}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  async findByEmail(email: string): Promise<Supplier | null> {
    return await this.supplierRepository.findOne({ where: { email } });
  }

  async update(id: number, updateDto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.findById(id);

    // Check for duplicate email if updating
    if (updateDto.email && updateDto.email !== supplier.email) {
      const existing = await this.findByEmail(updateDto.email);
      if (existing) {
        throw new ConflictException('Supplier with this email already exists');
      }
    }

    Object.assign(supplier, updateDto);
    return await this.supplierRepository.save(supplier);
  }

  async delete(id: number): Promise<boolean> {
    const supplier = await this.findById(id);

    // Check if supplier has any purchases
    const purchaseCount = await this.dataSource.query(
      'SELECT COUNT(*) as count FROM purchases WHERE supplier_id = $1',
      [id],
    );

    if (parseInt(purchaseCount[0]?.count) > 0) {
      throw new BadRequestException('Cannot delete supplier with existing purchases');
    }

    await this.supplierRepository.remove(supplier);
    return true;
  }

  async getSupplierStats(): Promise<SupplierStats> {
    const stats = await this.supplierRepository
      .createQueryBuilder('supplier')
      .select([
        'COUNT(*) as total_suppliers',
        "COUNT(CASE WHEN supplier.status = 'active' THEN 1 END) as active_count",
        "COUNT(CASE WHEN supplier.status = 'inactive' THEN 1 END) as inactive_count",
        'COALESCE(SUM(supplier.credit_limit), 0) as total_credit_limit',
      ])
      .getRawOne();

    return {
      totalSuppliers: parseInt(stats.total_suppliers) || 0,
      activeCount: parseInt(stats.active_count) || 0,
      inactiveCount: parseInt(stats.inactive_count) || 0,
      totalCreditLimit: parseFloat(stats.total_credit_limit) || 0,
    };
  }

  async getSupplierPurchases(supplierId: number, filters: SupplierPurchasesFiltersDto): Promise<any[]> {
    await this.findById(supplierId); // Verify supplier exists

    const { dateFrom, dateTo, page = 1, limit = 50 } = filters;

    let query = `
      SELECT * FROM purchases 
      WHERE supplier_id = $1
    `;
    const params: any[] = [supplierId];
    let paramIndex = 2;

    if (dateFrom) {
      query += ` AND purchase_date >= $${paramIndex}`;
      params.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      query += ` AND purchase_date <= $${paramIndex}`;
      params.push(dateTo);
      paramIndex++;
    }

    const offset = (page - 1) * limit;
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    return await this.dataSource.query(query, params);
  }

  private mapToSnakeCase(camelCase: string): string {
    const mapping: Record<string, string> = {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      creditLimit: 'credit_limit',
      contactPerson: 'contact_person',
      taxNumber: 'tax_number',
      paymentTerms: 'payment_terms',
    };
    return mapping[camelCase] || camelCase;
  }
}
