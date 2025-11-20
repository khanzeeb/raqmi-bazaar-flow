import { BaseService } from '../common/BaseService';
import { IQuotationService } from '../interfaces/IService';
import { QuotationData, QuotationFilters, CreateQuotationDTO, UpdateQuotationDTO } from '../models/Quotation';
import { CreateQuotationItemDTO } from '../models/QuotationItem';
import { QuotationRepository } from '../repositories/QuotationRepository';
import { QuotationItemRepository } from '../repositories/QuotationItemRepository';
import { QuotationItemMapper } from '../mappers/QuotationItemMapper';

export class QuotationService extends BaseService<QuotationData, CreateQuotationDTO, UpdateQuotationDTO, QuotationFilters> implements IQuotationService {
  private quotationItemRepository: QuotationItemRepository;

  constructor() {
    const quotationRepository = new QuotationRepository();
    super(quotationRepository);
    this.quotationItemRepository = new QuotationItemRepository();
  }

  protected async validateCreateData(data: CreateQuotationDTO): Promise<any> {
    // Validate validity date is after quotation date
    if (new Date(data.validity_date) < new Date(data.quotation_date)) {
      throw new Error('Validity date must be on or after quotation date');
    }
    return data;
  }

  protected async validateUpdateData(data: UpdateQuotationDTO): Promise<any> {
    // Validate validity date is after quotation date if both are provided
    if (data.quotation_date && data.validity_date) {
      if (new Date(data.validity_date) < new Date(data.quotation_date)) {
        throw new Error('Validity date must be on or after quotation date');
      }
    }
    return data;
  }

  async createQuotation(quotationData: CreateQuotationDTO, items: CreateQuotationItemDTO[]): Promise<any> {
    // Create quotation
    const quotation = await this.create(quotationData);
    
    // Create quotation items
    if (items && items.length > 0) {
      const itemsWithLineTotal = items.map(item => ({
        ...item,
        line_total: QuotationItemMapper.calculateLineTotal(
          item.quantity,
          item.unit_price,
          item.discount_amount || 0,
          item.tax_amount || 0
        )
      }));
      
      await this.quotationItemRepository.createBulk(quotation.id, itemsWithLineTotal as any);
    }
    
    // Return quotation with items
    return this.getQuotationWithItems(quotation.id);
  }

  async updateQuotation(id: string, quotationData: UpdateQuotationDTO, items?: CreateQuotationItemDTO[]): Promise<any> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Quotation not found');
    }
    
    // Check if quotation can be modified
    if (existing.status === 'converted' || existing.status === 'accepted') {
      throw new Error('Cannot modify converted or accepted quotation');
    }
    
    // Update quotation
    const updated = await this.update(id, quotationData);
    
    // Update quotation items if provided
    if (items && items.length > 0) {
      const itemsWithLineTotal = items.map(item => ({
        ...item,
        line_total: QuotationItemMapper.calculateLineTotal(
          item.quantity,
          item.unit_price,
          item.discount_amount || 0,
          item.tax_amount || 0
        )
      }));
      
      await this.quotationItemRepository.createBulk(id, itemsWithLineTotal as any);
    }
    
    return this.getQuotationWithItems(id);
  }

  async sendQuotation(id: string): Promise<any> {
    const quotation = await this.getById(id);
    if (!quotation) {
      throw new Error('Quotation not found');
    }
    
    if (quotation.status !== 'draft') {
      throw new Error('Can only send draft quotations');
    }
    
    return this.update(id, { status: 'sent' } as UpdateQuotationDTO);
  }

  async acceptQuotation(id: string): Promise<any> {
    const quotation = await this.getById(id);
    if (!quotation) {
      throw new Error('Quotation not found');
    }
    
    if (quotation.status !== 'sent') {
      throw new Error('Can only accept sent quotations');
    }
    
    return this.update(id, { status: 'accepted' } as UpdateQuotationDTO);
  }

  async declineQuotation(id: string, reason?: string): Promise<any> {
    const quotation = await this.getById(id);
    if (!quotation) {
      throw new Error('Quotation not found');
    }
    
    if (quotation.status !== 'sent') {
      throw new Error('Can only decline sent quotations');
    }
    
    const updateData: UpdateQuotationDTO = { status: 'declined' };
    if (reason) {
      updateData.notes = `${quotation.notes || ''}\n\nDecline reason: ${reason}`.trim();
    }
    
    return this.update(id, updateData);
  }

  async convertToSale(id: string): Promise<any> {
    const quotation = await this.getById(id);
    if (!quotation) {
      throw new Error('Quotation not found');
    }
    
    if (quotation.status !== 'accepted') {
      throw new Error('Can only convert accepted quotations to sales');
    }
    
    // Update quotation status
    await this.update(id, { status: 'converted' } as UpdateQuotationDTO);
    
    // Return conversion data (in real implementation, this would create a sale)
    return {
      quotation_id: id,
      status: 'converted',
      message: 'Quotation marked as converted. Sale creation should be handled separately.'
    };
  }

  async updateQuotationStatus(id: string, status: QuotationData['status']): Promise<any> {
    const quotation = await this.getById(id);
    if (!quotation) {
      throw new Error('Quotation not found');
    }
    
    return this.update(id, { status } as UpdateQuotationDTO);
  }

  async getExpiredQuotations(): Promise<QuotationData[]> {
    return (this.repository as QuotationRepository).getExpiredQuotations();
  }

  async getQuotationStats(filters?: QuotationFilters): Promise<any> {
    return (this.repository as QuotationRepository).getQuotationStats(filters);
  }

  async generateQuotationReport(filters?: QuotationFilters): Promise<any> {
    const quotations = await this.getAll(filters);
    const stats = await this.getQuotationStats(filters);
    
    return {
      quotations: quotations.data,
      statistics: stats,
      summary: {
        total_quotations: quotations.total,
        date_range: {
          from: filters?.date_from,
          to: filters?.date_to
        }
      }
    };
  }

  async processExpiredQuotations(): Promise<number> {
    const expiredQuotations = await this.getExpiredQuotations();
    let processedCount = 0;
    
    for (const quotation of expiredQuotations) {
      await this.update(quotation.id, { status: 'expired' } as UpdateQuotationDTO);
      processedCount++;
    }
    
    return processedCount;
  }

  private async getQuotationWithItems(id: string): Promise<any> {
    const quotation = await this.getById(id);
    const items = await this.quotationItemRepository.findByQuotationId(id);
    
    return {
      ...quotation,
      items
    };
  }
}
