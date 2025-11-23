export interface IRepository<T> {
  findAll(filters?: any): Promise<T[]>;
  findById(id: string): Promise<T | undefined>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | undefined>;
  delete(id: string): Promise<boolean>;
}
