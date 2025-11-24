import { IRepository } from '../interfaces/IRepository';
import { IService } from '../interfaces/IService';

export abstract class BaseService<T, CreateDTO, UpdateDTO, FilterDTO> implements IService<T, CreateDTO, UpdateDTO, FilterDTO> {
  constructor(protected repository: IRepository<T, FilterDTO>) {}

  async getById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }

  async getAll(filters?: FilterDTO): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.repository.findAll(filters);
  }

  async create(data: CreateDTO): Promise<T> {
    return this.repository.create(data as any);
  }

  async update(id: string, data: UpdateDTO): Promise<T | null> {
    return this.repository.update(id, data as Partial<T>);
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
