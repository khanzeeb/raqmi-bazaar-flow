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

export interface ISaleService extends IService<any, any, any, any> {
  createSale(saleData: any, items: any[]): Promise<any>;
  updateSale(id: string, saleData: any, items?: any[]): Promise<any | null>;
  createSalePayment(saleId: string, paymentData: any): Promise<any>;
  createPartialPayment(saleId: string, paymentData: any): Promise<any>;
  createFullPayment(saleId: string, paymentData: any): Promise<any>;
  allocateExistingPayment(saleId: string, paymentId: string, amount: number): Promise<any>;
  getOverdueSales(): Promise<any[]>;
  cancelSale(id: string, reason: string): Promise<any | null>;
  getSaleStats(filters?: any): Promise<any>;
  generateSaleReport(filters?: any): Promise<any>;
  processOverdueReminders(): Promise<number>;
}

export interface IReturnService extends IService<any, any, any, any> {
  getSaleReturns(saleId: string): Promise<any[]>;
  getSaleStateBeforeReturn(saleId: string, returnId?: string): Promise<any>;
  getSaleStateAfterReturn(saleId: string, returnId: string): Promise<any>;
}

export interface IPaymentService extends IService<any, any, any, any> {
  getByCustomerId(customerId: string): Promise<any[]>;
  allocateToOrder(paymentId: string, orderId: string, orderType: string, amount: number): Promise<any>;
  getUnallocatedAmount(paymentId: string): Promise<number>;
}