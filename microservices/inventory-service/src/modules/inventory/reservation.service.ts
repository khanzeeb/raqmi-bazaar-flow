import { Injectable, BadRequestException } from '@nestjs/common';
import { InventoryRepository } from './inventory.repository';
import { CheckStockDto, ReserveStockDto, ReleaseStockDto } from './dto';

interface Reservation {
  items: Array<{ product_id: string; quantity: number }>;
  created_at: Date;
  expires_at: Date;
  status: 'active' | 'released' | 'expired';
}

/** Handles stock checking, reservations, and releases (SRP). */
@Injectable()
export class ReservationService {
  private readonly reservations = new Map<string, Reservation>();
  private readonly TTL_MS = 15 * 60 * 1000;

  constructor(private readonly repo: InventoryRepository) {
    setInterval(() => this.cleanup(), 60_000);
  }

  async checkStock(dto: CheckStockDto) {
    const results = await Promise.all(
      dto.items.map(async (item) => {
        const inv = await this.repo.findByProductId(item.product_id);
        const available = inv?.current_stock ?? 0;
        return {
          product_id: item.product_id,
          product_name: item.product_name,
          requested_quantity: item.quantity,
          available_quantity: available,
          is_available: available >= item.quantity,
        };
      }),
    );
    return {
      available: results.every((r) => r.is_available),
      items: results,
    };
  }

  async reserve(dto: ReserveStockDto) {
    // Verify availability first
    const check = await this.checkStock({ items: dto.items });
    const unavailable = check.items.filter((i) => !i.is_available);
    if (unavailable.length) {
      throw new BadRequestException({
        message: 'Insufficient stock',
        unavailable_items: unavailable,
      });
    }

    const id = `res-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    this.reservations.set(id, {
      items: dto.items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      created_at: new Date(),
      expires_at: new Date(Date.now() + this.TTL_MS),
      status: 'active',
    });

    return {
      reservation_id: id,
      sale_id: dto.sale_id,
      items: dto.items.map((i) => ({ product_id: i.product_id, reserved_quantity: i.quantity })),
    };
  }

  async release(dto: ReleaseStockDto) {
    const res = this.reservations.get(dto.reservation_id);
    if (res && res.status === 'active') {
      res.status = 'released';
    }
    return {
      reservation_id: dto.reservation_id,
      sale_id: dto.sale_id,
      message: 'Inventory released successfully',
    };
  }

  /** Mark consumed reservation after sale confirmation. */
  consume(reservationId: string) {
    const res = this.reservations.get(reservationId);
    if (res) res.status = 'released';
  }

  private cleanup() {
    const now = Date.now();
    for (const [id, r] of this.reservations) {
      if (r.status === 'active' && r.expires_at.getTime() < now) {
        r.status = 'expired';
      }
    }
  }
}
