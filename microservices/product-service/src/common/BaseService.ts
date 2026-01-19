// Base Service - Common business logic patterns
import { IPaginatedResponse } from '../interfaces/IProduct';

export interface IBaseRepository<T, TFilters> {
  findById(id: string): Promise<T | null>;
  findAll(filters: TFilters): Promise<IPaginatedResponse<T>>;
  create(data: any): Promise<T>;
  update(id: string, data: any): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(filters: TFilters): Promise<number>;
}

export abstract class BaseService<
  T,
  TCreateDTO,
  TUpdateDTO,
  TFilters,
  TRepository extends IBaseRepository<T, TFilters>
> {
  protected repository: TRepository;

  constructor(repository: TRepository) {
    this.repository = repository;
  }

  /**
   * Get entity by ID
   */
  async getById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }

  /**
   * Get all entities with filters
   */
  async getAll(filters?: TFilters): Promise<IPaginatedResponse<T>> {
    return this.repository.findAll(filters || {} as TFilters);
  }

  /**
   * Count entities with filters
   */
  async count(filters?: TFilters): Promise<number> {
    return this.repository.count(filters || {} as TFilters);
  }

  /**
   * Create new entity - override for validation
   */
  async create(data: TCreateDTO): Promise<T> {
    this.validateCreate(data);
    const transformedData = this.transformCreateData(data);
    return this.repository.create(transformedData);
  }

  /**
   * Update existing entity
   */
  async update(id: string, data: TUpdateDTO): Promise<T | null> {
    const existing = await this.repository.findById(id);
    if (!existing) return null;

    this.validateUpdate(data);
    const transformedData = this.transformUpdateData(data);
    return this.repository.update(id, transformedData);
  }

  /**
   * Delete entity
   */
  async delete(id: string): Promise<boolean> {
    const existing = await this.repository.findById(id);
    if (!existing) return false;
    return this.repository.delete(id);
  }

  /**
   * Validate create data - override in subclasses
   */
  protected validateCreate(data: TCreateDTO): void {
    // Default: no validation. Override in subclass.
  }

  /**
   * Validate update data - override in subclasses
   */
  protected validateUpdate(data: TUpdateDTO): void {
    // Default: no validation. Override in subclass.
  }

  /**
   * Transform create data before saving - override in subclasses
   */
  protected transformCreateData(data: TCreateDTO): any {
    return data;
  }

  /**
   * Transform update data before saving - override in subclasses
   */
  protected transformUpdateData(data: TUpdateDTO): any {
    return data;
  }
}
