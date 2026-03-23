import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { SupplierRepository } from './supplier.repository';
import { SupplierMapper } from './supplier.mapper';
import {
  CreateSupplierDto, UpdateSupplierDto, SupplierFiltersDto,
  CreateSupplierContactDto, UpdateSupplierContactDto,
  CreateSupplierRatingDto,
} from './dto';

/** Orchestrates supplier business logic (SRP). */
@Injectable()
export class SupplierService {
  constructor(private readonly repo: SupplierRepository) {}

  // ─── Supplier CRUD ───

  async getById(id: string) {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundException('Supplier not found');
    return row;
  }

  async getAll(filters: SupplierFiltersDto) {
    return this.repo.findAll(filters);
  }

  async create(dto: CreateSupplierDto) {
    await this.validateUniqueEmail(dto.email);
    const data = SupplierMapper.toRow(dto);
    return this.repo.create(data);
  }

  async update(id: string, dto: UpdateSupplierDto) {
    const existing = await this.getById(id);
    if (dto.email && dto.email !== existing.email) {
      await this.validateUniqueEmail(dto.email);
    }
    const data = SupplierMapper.updateToRow(dto);
    return this.repo.update(id, data);
  }

  async remove(id: string) {
    await this.getById(id);
    const purchaseCount = await this.repo.getPurchaseCount(id);
    if (purchaseCount > 0) {
      throw new BadRequestException('Cannot delete supplier with existing purchases');
    }
    return this.repo.delete(id);
  }

  async getStats() {
    return this.repo.getStats();
  }

  // ─── Contacts ───

  async getContacts(supplierId: string) {
    await this.getById(supplierId); // verify supplier exists
    return this.repo.findContactsBySupplierId(supplierId);
  }

  async addContact(supplierId: string, dto: CreateSupplierContactDto) {
    await this.getById(supplierId);
    if (dto.isPrimary) {
      await this.repo.resetPrimaryContacts(supplierId);
    }
    const data = SupplierMapper.contactToRow(dto, supplierId);
    return this.repo.createContact(data);
  }

  async updateContact(supplierId: string, contactId: string, dto: UpdateSupplierContactDto) {
    await this.getById(supplierId);
    const contact = await this.repo.findContactById(contactId);
    if (!contact || contact.supplier_id !== supplierId) {
      throw new NotFoundException('Contact not found');
    }
    if (dto.isPrimary) {
      await this.repo.resetPrimaryContacts(supplierId, contactId);
    }
    const data = SupplierMapper.contactUpdateToRow(dto);
    return this.repo.updateContact(contactId, data);
  }

  async removeContact(supplierId: string, contactId: string) {
    await this.getById(supplierId);
    const contact = await this.repo.findContactById(contactId);
    if (!contact || contact.supplier_id !== supplierId) {
      throw new NotFoundException('Contact not found');
    }
    return this.repo.deleteContact(contactId);
  }

  // ─── Ratings ───

  async getRatings(supplierId: string) {
    await this.getById(supplierId);
    return this.repo.findRatingsBySupplierId(supplierId);
  }

  async getAverageRating(supplierId: string) {
    await this.getById(supplierId);
    return this.repo.getAverageRating(supplierId);
  }

  async addRating(supplierId: string, dto: CreateSupplierRatingDto) {
    await this.getById(supplierId);
    const data = SupplierMapper.ratingToRow(dto, supplierId);
    return this.repo.createRating(data);
  }

  // ─── Validation helpers (DRY) ───

  private async validateUniqueEmail(email?: string) {
    if (!email) return;
    const existing = await this.repo.findByEmail(email);
    if (existing) {
      throw new ConflictException('Supplier with this email already exists');
    }
  }
}
