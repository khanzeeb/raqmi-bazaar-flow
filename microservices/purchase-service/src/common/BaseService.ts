import { IRepository } from '../interfaces/IRepository';

export abstract class BaseService<T> {
  protected repository: IRepository<T>;

  constructor(repository: IRepository<T>) {
    this.repository = repository;
  }

  async getAll(filters?: any): Promise<T[]> {
    return this.repository.findAll(filters);
  }

  async getById(id: string): Promise<T | undefined> {
    return this.repository.findById(id);
  }

  async create(data: Partial<T>): Promise<T> {
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<T>): Promise<T | undefined> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
