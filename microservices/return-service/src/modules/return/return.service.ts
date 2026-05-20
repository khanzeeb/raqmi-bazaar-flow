import {
  Injectable, NotFoundException, BadRequestException, ConflictException,
} from '@nestjs/common';
import { ReturnRepository } from './return.repository';
import { ReturnMapper } from './return.mapper';
import {
  CreateReturnDto, UpdateReturnDto, ReturnFiltersDto,
  ProcessReturnDto, RejectReturnDto, ReturnStatus, RefundStatus,
} from './dto';

/** Orchestrates return business logic (SRP). */
@Injectable()
export class ReturnService {
  constructor(private readonly repo: ReturnRepository) {}

  // ─── CRUD ───

  async getById(id: string) {
    const ret = await this.repo.findById(id);
    if (!ret) throw new NotFoundException('Return not found');
    const items = await this.repo.findItemsByReturnId(id);
    return { ...ret, items };
  }

  async getAll(filters: ReturnFiltersDto) {
    return this.repo.findAll(filters);
  }

  async getBySaleId(saleId: string) {
    return this.repo.findBySaleId(saleId);
  }

  async getByCustomerId(customerId: string) {
    return this.repo.findByCustomerId(customerId);
  }

  async create(dto: CreateReturnDto) {
    this.validateItems(dto);
    await this.validateNotOverReturned(dto);

    const returnNumber = await this.repo.generateReturnNumber();
    const totalAmount = ReturnMapper.calculateTotal(dto.items);
    const headerRow = ReturnMapper.toRow(dto, returnNumber, totalAmount);

    return this.repo.withinTransaction(async (trx) => {
      const created = await this.repo.create(headerRow, trx);
      const itemRows = dto.items.map((i) => ReturnMapper.itemToRow(i, created.id));
      const items = await this.repo.createItems(itemRows, trx);
      return { ...created, items };
    });
  }

  async update(id: string, dto: UpdateReturnDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Return not found');
    if (existing.status === ReturnStatus.COMPLETED) {
      throw new ConflictException('Cannot update a completed return');
    }
    const row = ReturnMapper.updateToRow(dto);
    return this.repo.update(id, row);
  }

  async remove(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Return not found');
    if (existing.status !== ReturnStatus.PENDING) {
      throw new ConflictException('Only pending returns can be deleted');
    }
    return this.repo.delete(id);
  }

  // ─── Workflow ───

  async approve(id: string, processedBy?: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Return not found');
    if (existing.status !== ReturnStatus.PENDING) {
      throw new ConflictException('Only pending returns can be approved');
    }
    return this.repo.update(id, {
      status: ReturnStatus.APPROVED,
      processed_by: processedBy ?? null,
      processed_at: new Date(),
    });
  }

  async reject(id: string, dto: RejectReturnDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Return not found');
    if (existing.status !== ReturnStatus.PENDING) {
      throw new ConflictException('Only pending returns can be rejected');
    }
    return this.repo.update(id, {
      status: ReturnStatus.REJECTED,
      processed_by: dto.processedBy ?? null,
      processed_at: new Date(),
      notes: dto.reason ?? existing.notes,
    });
  }

  async process(id: string, dto: ProcessReturnDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Return not found');
    if (existing.status !== ReturnStatus.APPROVED) {
      throw new ConflictException('Only approved returns can be processed');
    }
    const refundAmount = dto.refundAmount ?? Number(existing.total_amount);
    if (refundAmount < 0 || refundAmount > Number(existing.total_amount)) {
      throw new BadRequestException('Invalid refund amount');
    }
    return this.repo.update(id, {
      status: ReturnStatus.COMPLETED,
      refund_status: RefundStatus.PROCESSED,
      refund_amount: refundAmount,
      processed_by: dto.processedBy ?? existing.processed_by,
      processed_at: new Date(),
    });
  }

  // ─── Stats ───

  async getStats(dateFrom?: string, dateTo?: string) {
    return this.repo.getStats(dateFrom, dateTo);
  }

  // ─── Validation helpers (DRY) ───

  private validateItems(dto: CreateReturnDto) {
    for (const item of dto.items) {
      if (item.quantityReturned > item.originalQuantity) {
        throw new BadRequestException(
          `Returned quantity exceeds original for product ${item.productName}`,
        );
      }
    }
  }

  private async validateNotOverReturned(dto: CreateReturnDto) {
    for (const item of dto.items) {
      const alreadyReturned = await this.repo.getSaleItemReturnedQty(item.saleItemId);
      if (alreadyReturned + item.quantityReturned > item.originalQuantity) {
        throw new BadRequestException(
          `Total returned quantity for ${item.productName} exceeds original sale quantity`,
        );
      }
    }
  }
}
