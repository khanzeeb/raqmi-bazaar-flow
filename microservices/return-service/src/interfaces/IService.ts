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

export interface IReturnService extends IService<any, any, any, any> {
  processReturn(id: string): Promise<any | null>;
  approveReturn(id: string): Promise<any | null>;
  rejectReturn(id: string, reason?: string): Promise<any | null>;
  processRefund(id: string): Promise<any | null>;
  getReturnStats(filters?: any): Promise<any>;
}
