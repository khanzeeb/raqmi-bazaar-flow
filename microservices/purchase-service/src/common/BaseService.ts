import { IRepository } from '../interfaces/IRepository';

export abstract class BaseService<T, CreateDTO, UpdateDTO, FilterDTO> {
  constructor(protected repository: IRepository<T, FilterDTO>) {}

  async getById(id: string): Promise<T | null> {
    return await this.repository.findById(id);
  }

  async getAll(filters?: FilterDTO): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await this.repository.findAll(filters);
  }

  async create(data: CreateDTO): Promise<T> {
    const validatedData = await this.validateCreateData(data);
    return await this.repository.create(validatedData);
  }

  async update(id: string, data: UpdateDTO): Promise<T | null> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return null;
    }
    
    const validatedData = await this.validateUpdateData(data);
    return await this.repository.update(id, validatedData);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return false;
    }
    
    return await this.repository.delete(id);
  }

  protected abstract validateCreateData(data: CreateDTO): Promise<any>;
  protected abstract validateUpdateData(data: UpdateDTO): Promise<any>;
}
