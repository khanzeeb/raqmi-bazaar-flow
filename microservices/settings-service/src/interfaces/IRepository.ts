export interface IRepository<T, F = any> {
  findById(id: string): Promise<T | null>;
  findAll(filters?: F): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  count(filters?: F): Promise<number>;
  create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export interface ISettingsRepository extends IRepository<any, any> {
  findByKey(key: string): Promise<any | null>;
  findByCategory(category: string): Promise<any[]>;
  bulkUpdate(settings: Array<{ key: string; value: any }>): Promise<boolean>;
}
