import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InventoryRepository } from './inventory.repository';
import {
  CreateInventoryDto, UpdateInventoryDto, InventoryFiltersDto,
  AdjustStockDto, TransferStockDto, StockStatus, MovementType,
} from './dto';
import { InventoryMapper } from './inventory.mapper';

/** Orchestrates inventory business logic (SRP). */
@Injectable()
export class InventoryService {
  constructor(private readonly repo: InventoryRepository) {}

  // ─── CRUD ───

  async getById(id: string) {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundException('Inventory item not found');
    return row;
  }

  async getAll(filters: InventoryFiltersDto) {
    return this.repo.findAll(filters);
  }

  async create(dto: CreateInventoryDto) {
    const data = InventoryMapper.toRow(dto);
    data.status = this.deriveStatus(dto.currentStock, dto.minimumStock ?? 0);
    return this.repo.create(data);
  }

  async update(id: string, dto: UpdateInventoryDto) {
    await this.getById(id); // ensures exists
    const data = InventoryMapper.updateToRow(dto);
    return this.repo.update(id, data);
  }

  async remove(id: string) {
    await this.getById(id);
    return this.repo.delete(id);
  }

  // ─── Domain operations ───

  async adjustStock(id: string, dto: AdjustStockDto) {
    return this.repo.withinTransaction(async (trx) => {
      const item = await this.getById(id);
      const newStock = item.current_stock + dto.quantity;
      if (newStock < 0) throw new BadRequestException('Insufficient stock');

      const status = this.deriveStatus(newStock, item.minimum_stock);
      await trx('inventory_items')
        .where({ id })
        .update({ current_stock: newStock, status, updated_at: trx.fn.now() });

      await trx('stock_movements').insert({
        product_id: item.product_id,
        type: dto.quantity >= 0 ? MovementType.IN : MovementType.OUT,
        quantity: Math.abs(dto.quantity),
        reason: dto.reason,
        reference: `adjust:${id}`,
        stock_before: item.current_stock,
        stock_after: newStock,
      });

      return { ...item, current_stock: newStock, status };
    });
  }

  async transferStock(id: string, dto: TransferStockDto) {
    return this.repo.withinTransaction(async (trx) => {
      const source = await this.getById(id);
      if (source.current_stock < dto.quantity) {
        throw new BadRequestException('Insufficient stock for transfer');
      }

      const newStock = source.current_stock - dto.quantity;
      await trx('inventory_items')
        .where({ id })
        .update({
          current_stock: newStock,
          status: this.deriveStatus(newStock, source.minimum_stock),
          updated_at: trx.fn.now(),
        });

      await trx('stock_movements').insert({
        product_id: source.product_id,
        type: MovementType.TRANSFER,
        quantity: dto.quantity,
        reason: dto.reason || `Transfer to ${dto.toLocation}`,
        reference: `transfer:${id}:${dto.toLocation}`,
        stock_before: source.current_stock,
        stock_after: newStock,
      });

      return { ...source, current_stock: newStock };
    });
  }

  async getLowStockItems(threshold?: number) {
    return this.repo.findLowStock(threshold);
  }

  async getMovements(productId: string) {
    return this.repo.getMovements(productId);
  }

  async getStats(filters?: { category?: string; location?: string }) {
    return this.repo.getStats(filters);
  }

  // ─── Helpers ───

  private deriveStatus(stock: number, minStock: number): StockStatus {
    if (stock <= 0) return StockStatus.OUT_OF_STOCK;
    if (stock <= minStock) return StockStatus.LOW_STOCK;
    return StockStatus.IN_STOCK;
  }
}
