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

export interface IInvoiceRepository extends IRepository<any, any> {
  updateStatus(id: string, status: string): Promise<any | null>;
  recordPayment(id: string, amount: number, paymentData: any): Promise<any | null>;
  markAsSent(id: string): Promise<any | null>;
  markAsPaid(id: string): Promise<any | null>;
  getStats(filters?: any): Promise<any>;
  getByStatus(filters?: any): Promise<any[]>;
  generateInvoiceNumber(): Promise<string>;
  getOverdueInvoices(): Promise<any[]>;
}
