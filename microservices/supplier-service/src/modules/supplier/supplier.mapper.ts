import {
  CreateSupplierDto, UpdateSupplierDto,
  CreateSupplierContactDto, UpdateSupplierContactDto,
  CreateSupplierRatingDto,
} from './dto';

/** Maps camelCase DTOs ↔ snake_case DB rows (SRP). */
export class SupplierMapper {

  // ─── Supplier ───

  static toRow(dto: CreateSupplierDto): Record<string, any> {
    return {
      name: dto.name,
      contact_person: dto.contactPerson ?? null,
      email: dto.email ?? null,
      phone: dto.phone ?? null,
      address: dto.address ?? null,
      city: dto.city ?? null,
      state: dto.state ?? null,
      postal_code: dto.postalCode ?? null,
      country: dto.country ?? 'US',
      tax_id: dto.taxId ?? null,
      status: dto.status ?? 'active',
      credit_limit: dto.creditLimit ?? 0,
      payment_terms: dto.paymentTerms ?? 'net_30',
      currency: dto.currency ?? 'USD',
      website: dto.website ?? null,
      notes: dto.notes ?? null,
    };
  }

  static updateToRow(dto: UpdateSupplierDto): Record<string, any> {
    const row: Record<string, any> = {};
    if (dto.name !== undefined) row.name = dto.name;
    if (dto.contactPerson !== undefined) row.contact_person = dto.contactPerson;
    if (dto.email !== undefined) row.email = dto.email;
    if (dto.phone !== undefined) row.phone = dto.phone;
    if (dto.address !== undefined) row.address = dto.address;
    if (dto.city !== undefined) row.city = dto.city;
    if (dto.state !== undefined) row.state = dto.state;
    if (dto.postalCode !== undefined) row.postal_code = dto.postalCode;
    if (dto.country !== undefined) row.country = dto.country;
    if (dto.taxId !== undefined) row.tax_id = dto.taxId;
    if (dto.status !== undefined) row.status = dto.status;
    if (dto.creditLimit !== undefined) row.credit_limit = dto.creditLimit;
    if (dto.paymentTerms !== undefined) row.payment_terms = dto.paymentTerms;
    if (dto.currency !== undefined) row.currency = dto.currency;
    if (dto.website !== undefined) row.website = dto.website;
    if (dto.notes !== undefined) row.notes = dto.notes;
    return row;
  }

  // ─── Contact ───

  static contactToRow(dto: CreateSupplierContactDto, supplierId: string): Record<string, any> {
    return {
      supplier_id: supplierId,
      name: dto.name,
      email: dto.email ?? null,
      phone: dto.phone ?? null,
      role: dto.role ?? null,
      is_primary: dto.isPrimary ?? false,
    };
  }

  static contactUpdateToRow(dto: UpdateSupplierContactDto): Record<string, any> {
    const row: Record<string, any> = {};
    if (dto.name !== undefined) row.name = dto.name;
    if (dto.email !== undefined) row.email = dto.email;
    if (dto.phone !== undefined) row.phone = dto.phone;
    if (dto.role !== undefined) row.role = dto.role;
    if (dto.isPrimary !== undefined) row.is_primary = dto.isPrimary;
    return row;
  }

  // ─── Rating ───

  static ratingToRow(dto: CreateSupplierRatingDto, supplierId: string): Record<string, any> {
    const overallScore = Math.round((dto.qualityScore + dto.deliveryScore + dto.pricingScore) / 3);
    return {
      supplier_id: supplierId,
      quality_score: dto.qualityScore,
      delivery_score: dto.deliveryScore,
      pricing_score: dto.pricingScore,
      overall_score: overallScore,
      comments: dto.comments ?? null,
      rated_by: dto.ratedBy ?? null,
    };
  }
}
