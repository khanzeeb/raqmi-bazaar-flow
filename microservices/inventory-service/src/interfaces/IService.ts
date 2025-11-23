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

export interface IQuotationService extends IService<any, any, any, any> {
  createQuotation(quotationData: any, items: any[]): Promise<any>;
  updateQuotation(id: string, quotationData: any, items?: any[]): Promise<any | null>;
  sendQuotation(id: string): Promise<any | null>;
  acceptQuotation(id: string): Promise<any | null>;
  declineQuotation(id: string, reason?: string): Promise<any | null>;
  convertToSale(id: string): Promise<any | null>;
  updateQuotationStatus(id: string, status: string): Promise<any | null>;
  getExpiredQuotations(): Promise<any[]>;
  getQuotationStats(filters?: any): Promise<any>;
  generateQuotationReport(filters?: any): Promise<any>;
  processExpiredQuotations(): Promise<number>;
}
