export interface IService<T, CreateDTO, UpdateDTO, FilterDTO> {
  getById(id: string): Promise<T | null>;
  getAll(filters?: FilterDTO): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  create(data: CreateDTO): Promise<T>;
  update(id: string, data: UpdateDTO): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export interface ISettingsService extends IService<any, any, any, any> {
  getByKey(key: string): Promise<any | null>;
  updateByKey(key: string, value: any): Promise<any | null>;
  getByCategory(category: string): Promise<any[]>;
  bulkUpdate(settings: Array<{ key: string; value: any }>): Promise<boolean>;
}
