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

export interface IInvoiceService extends IService<any, any, any, any> {
  updateStatus(id: string, status: string): Promise<any | null>;
  recordPayment(id: string, paymentData: any): Promise<any | null>;
  markAsSent(id: string): Promise<any | null>;
  markAsPaid(id: string): Promise<any | null>;
  generatePDF(id: string): Promise<Buffer>;
  sendEmail(id: string, emailData: any): Promise<boolean>;
  getStats(filters?: any): Promise<any>;
  getByStatus(filters?: any): Promise<any[]>;
  checkOverdue(): Promise<void>;
}
