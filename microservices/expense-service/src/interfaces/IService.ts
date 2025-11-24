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

export interface IExpenseService extends IService<any, any, any, any> {
  updateStatus(id: string, status: string): Promise<any | null>;
  approve(id: string): Promise<any | null>;
  attachReceipt(id: string, receiptUrl: string): Promise<any | null>;
  getStats(filters?: any): Promise<any>;
  getByCategory(filters?: any): Promise<any[]>;
}
