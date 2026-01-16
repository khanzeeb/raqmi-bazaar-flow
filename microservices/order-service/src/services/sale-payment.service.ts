/**
 * Sale Payment Service
 * Single Responsibility: Handle all payment-related operations for sales
 * Interface Segregation: Implements focused payment interface
 */

import { SalePaymentDTO } from '../dto';
import { SaleRepository, Sale } from '../models/Sale';
import { PaymentAllocationRepository } from '../models/PaymentAllocation';
import { PaymentError, SaleNotFoundError } from '../errors/sale.errors';

export interface ISalePaymentService {
  createPayment(saleId: string, paymentData: SalePaymentDTO): Promise<any>;
  createPartialPayment(saleId: string, paymentData: SalePaymentDTO): Promise<any>;
  createFullPayment(saleId: string, paymentData: SalePaymentDTO): Promise<any>;
  allocateExistingPayment(saleId: string, paymentId: string, amount: number): Promise<any>;
  getRemainingBalance(saleId: string): Promise<number>;
}

export class SalePaymentService implements ISalePaymentService {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly paymentAllocationRepository: PaymentAllocationRepository
  ) {}

  async createPayment(saleId: string, paymentData: SalePaymentDTO): Promise<any> {
    const sale = await this.saleRepository.findById(saleId);
    if (!sale) {
      throw new SaleNotFoundError(saleId);
    }

    this.validatePaymentAmount(sale, paymentData.amount);

    const allocation = await this.paymentAllocationRepository.create({
      order_id: saleId,
      order_type: 'sale',
      allocated_amount: paymentData.amount,
      payment_method: paymentData.payment_method_code,
      payment_date: paymentData.payment_date,
      reference: paymentData.reference,
      notes: paymentData.notes,
    } as any);

    await this.saleRepository.updatePaymentAmounts(saleId);

    return {
      success: true,
      allocation_id: allocation.id,
      sale_id: saleId,
      amount: paymentData.amount,
    };
  }

  async createPartialPayment(saleId: string, paymentData: SalePaymentDTO): Promise<any> {
    const sale = await this.saleRepository.findById(saleId);
    if (!sale) {
      throw new SaleNotFoundError(saleId);
    }

    if (paymentData.amount >= sale.balance_amount) {
      throw new PaymentError(
        'Partial payment amount must be less than remaining balance',
        saleId
      );
    }

    return this.createPayment(saleId, paymentData);
  }

  async createFullPayment(saleId: string, paymentData: SalePaymentDTO): Promise<any> {
    const sale = await this.saleRepository.findById(saleId);
    if (!sale) {
      throw new SaleNotFoundError(saleId);
    }

    const fullPaymentData: SalePaymentDTO = {
      ...paymentData,
      amount: sale.balance_amount,
    };

    return this.createPayment(saleId, fullPaymentData);
  }

  async allocateExistingPayment(saleId: string, paymentId: string, amount: number): Promise<any> {
    const sale = await this.saleRepository.findById(saleId);
    if (!sale) {
      throw new SaleNotFoundError(saleId);
    }

    this.validatePaymentAmount(sale, amount);

    const allocation = await this.paymentAllocationRepository.create({
      order_id: saleId,
      order_type: 'sale',
      payment_id: paymentId,
      allocated_amount: amount,
    } as any);

    await this.saleRepository.updatePaymentAmounts(saleId);

    return {
      success: true,
      allocation_id: allocation.id,
      sale_id: saleId,
      payment_id: paymentId,
      amount,
    };
  }

  async getRemainingBalance(saleId: string): Promise<number> {
    const sale = await this.saleRepository.findById(saleId);
    if (!sale) {
      throw new SaleNotFoundError(saleId);
    }
    return sale.balance_amount;
  }

  private validatePaymentAmount(sale: Sale, amount: number): void {
    if (amount <= 0) {
      throw new PaymentError('Payment amount must be greater than zero', sale.id);
    }

    if (amount > sale.balance_amount) {
      throw new PaymentError(
        `Payment amount (${amount}) exceeds remaining balance (${sale.balance_amount})`,
        sale.id
      );
    }
  }
}
