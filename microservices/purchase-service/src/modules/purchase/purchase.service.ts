import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PurchaseRepository } from './purchase.repository';
import {
  CreatePurchaseDto, UpdatePurchaseDto, PurchaseFiltersDto,
  UpdateStatusDto, ReceivePurchaseDto, AddPaymentDto, PurchaseStatus,
} from './dto';
import { PurchaseMapper } from './purchase.mapper';

/** Orchestrates purchase business logic (SRP). */
@Injectable()
export class PurchaseService {
  constructor(private readonly repo: PurchaseRepository) {}

  // ─── CRUD ───

  async getById(id: string) {
    const purchase = await this.repo.findById(id);
    if (!purchase) throw new NotFoundException('Purchase not found');
    const items = await this.repo.findItemsByPurchaseId(id);
    return { ...purchase, items };
  }

  async getAll(filters: PurchaseFiltersDto) {
    return this.repo.findAll(filters);
  }

  async create(dto: CreatePurchaseDto) {
    const purchaseNumber = await this.repo.generatePurchaseNumber();
    const data = PurchaseMapper.toRow(dto, purchaseNumber);

    return this.repo.withinTransaction(async (trx) => {
      const [purchase] = await trx('purchases').insert(data).returning('*');

      if (dto.items?.length) {
        const rows = PurchaseMapper.itemsToRows(dto.items, purchase.id);
        await trx('purchase_items').insert(rows);
      }

      const items = await trx('purchase_items').where({ purchase_id: purchase.id });
      return { ...purchase, items };
    });
  }

  async update(id: string, dto: UpdatePurchaseDto) {
    await this.getById(id); // ensures exists
    const data = PurchaseMapper.updateToRow(dto);

    return this.repo.withinTransaction(async (trx) => {
      const [purchase] = await trx('purchases')
        .where({ id })
        .update({ ...data, updated_at: trx.fn.now() })
        .returning('*');

      if (dto.items) {
        const rows = PurchaseMapper.itemsToRows(dto.items, id);
        await this.repo.replaceItems(id, rows, trx);
      }

      const items = await trx('purchase_items').where({ purchase_id: id });
      return { ...purchase, items };
    });
  }

  async remove(id: string) {
    return this.repo.withinTransaction(async (trx) => {
      await trx('purchase_items').where({ purchase_id: id }).del();
      const deleted = await trx('purchases').where({ id }).del();
      if (!deleted) throw new NotFoundException('Purchase not found');
      return true;
    });
  }

  // ─── Domain operations ───

  async updateStatus(id: string, dto: UpdateStatusDto) {
    const purchase = await this.getById(id);
    const updateData: Record<string, any> = { status: dto.status };
    if (dto.status === PurchaseStatus.RECEIVED) {
      updateData.received_date = new Date();
    }
    return this.repo.update(id, updateData);
  }

  async receivePurchase(id: string, dto: ReceivePurchaseDto) {
    return this.repo.withinTransaction(async (trx) => {
      if (dto.items?.length) {
        for (const item of dto.items) {
          await trx('purchase_items')
            .where({ id: item.itemId })
            .update({ received_quantity: item.receivedQuantity });
        }
      } else {
        // Auto-fill: set received = ordered quantity for all items
        await trx.raw(`
          UPDATE purchase_items SET received_quantity = quantity
          WHERE purchase_id = ?
        `, [id]);
      }

      const [purchase] = await trx('purchases')
        .where({ id })
        .update({ status: 'received', received_date: new Date(), updated_at: trx.fn.now() })
        .returning('*');

      if (!purchase) throw new NotFoundException('Purchase not found');

      const items = await trx('purchase_items').where({ purchase_id: id });
      return { ...purchase, items };
    });
  }

  async addPayment(id: string, dto: AddPaymentDto) {
    const purchase = await this.getById(id);
    const newPaid = Number(purchase.paid_amount) + dto.amount;
    const total = Number(purchase.total_amount);

    if (newPaid > total) {
      throw new BadRequestException('Payment exceeds total amount');
    }

    const paymentStatus = newPaid >= total ? 'paid' : newPaid > 0 ? 'partial' : 'pending';
    return this.repo.update(id, { paid_amount: newPaid, payment_status: paymentStatus });
  }

  async getStats(filters?: { startDate?: string; endDate?: string }) {
    return this.repo.getStats(filters);
  }
}
