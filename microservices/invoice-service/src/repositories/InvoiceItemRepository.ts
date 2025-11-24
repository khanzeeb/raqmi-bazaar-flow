import { BaseRepository } from '../common/BaseRepository';
import { InvoiceItem } from '../models/InvoiceItem';

export class InvoiceItemRepository extends BaseRepository<InvoiceItem> {
  constructor() {
    super('invoice_items');
  }

  async findByInvoiceId(invoiceId: string): Promise<InvoiceItem[]> {
    return this.db('invoice_items').where({ invoice_id: invoiceId });
  }

  async deleteByInvoiceId(invoiceId: string): Promise<boolean> {
    const deleted = await this.db('invoice_items').where({ invoice_id: invoiceId }).delete();
    return deleted > 0;
  }
}
