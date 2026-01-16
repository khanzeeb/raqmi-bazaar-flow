/**
 * Sale Statistics Service
 * Single Responsibility: Handle reporting and statistics for sales
 */

import { SaleRepository, Sale, SaleFilters } from '../models/Sale';
import { SaleFiltersDTO } from '../dto';

export interface ISaleStatsService {
  getSaleStats(filters?: SaleFiltersDTO): Promise<SaleStats>;
  getOverdueSales(): Promise<Sale[]>;
  generateReport(filters?: SaleFiltersDTO): Promise<SaleReport>;
  processOverdueReminders(): Promise<OverdueReminderResult>;
}

export interface SaleStats {
  total_sales: number;
  total_revenue: number;
  total_collected: number;
  total_outstanding: number;
  average_sale_value: number;
  paid_sales: number;
  overdue_sales: number;
}

export interface SaleReport {
  sales: {
    data: Sale[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: SaleStats;
  generated_at: string;
}

export interface OverdueReminderResult {
  processed_count: number;
  sent_reminders: string[];
  failed_reminders: string[];
}

export class SaleStatsService implements ISaleStatsService {
  constructor(private readonly saleRepository: SaleRepository) {}

  async getSaleStats(filters?: SaleFiltersDTO): Promise<SaleStats> {
    const stats = await this.saleRepository.getSaleStats(filters as SaleFilters);
    
    return {
      total_sales: Number(stats.total_sales) || 0,
      total_revenue: Number(stats.total_revenue) || 0,
      total_collected: Number(stats.total_collected) || 0,
      total_outstanding: Number(stats.total_outstanding) || 0,
      average_sale_value: Number(stats.average_sale_value) || 0,
      paid_sales: Number(stats.paid_sales) || 0,
      overdue_sales: Number(stats.overdue_sales) || 0,
    };
  }

  async getOverdueSales(): Promise<Sale[]> {
    return this.saleRepository.getOverdueSales();
  }

  async generateReport(filters?: SaleFiltersDTO): Promise<SaleReport> {
    const [sales, stats] = await Promise.all([
      this.saleRepository.findAll(filters as SaleFilters),
      this.getSaleStats(filters),
    ]);

    return {
      sales,
      stats,
      generated_at: new Date().toISOString(),
    };
  }

  async processOverdueReminders(): Promise<OverdueReminderResult> {
    const overdueSales = await this.getOverdueSales();
    const sentReminders: string[] = [];
    const failedReminders: string[] = [];

    for (const sale of overdueSales) {
      try {
        // TODO: Implement actual reminder sending logic
        // await this.reminderService.sendOverdueReminder(sale);
        sentReminders.push(sale.id);
      } catch (error) {
        failedReminders.push(sale.id);
      }
    }

    return {
      processed_count: overdueSales.length,
      sent_reminders: sentReminders,
      failed_reminders: failedReminders,
    };
  }
}
