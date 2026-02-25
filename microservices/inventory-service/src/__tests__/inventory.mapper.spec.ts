import { InventoryMapper } from '../modules/inventory/inventory.mapper';
import { StockStatus } from '../modules/inventory/dto';

describe('InventoryMapper', () => {
  describe('toRow', () => {
    it('maps camelCase DTO to snake_case row', () => {
      const row = InventoryMapper.toRow({
        productId: 'p1',
        productName: 'Widget',
        sku: 'W-001',
        currentStock: 50,
        minimumStock: 10,
        maximumStock: 200,
        unitCost: 5.5,
        unitPrice: 12,
        location: 'A1',
        supplier: 'Acme',
        category: 'parts',
        notes: 'Test',
      });

      expect(row.product_id).toBe('p1');
      expect(row.product_name).toBe('Widget');
      expect(row.sku).toBe('W-001');
      expect(row.current_stock).toBe(50);
      expect(row.minimum_stock).toBe(10);
      expect(row.unit_cost).toBe(5.5);
      expect(row.location).toBe('A1');
    });

    it('defaults optional fields to null/0', () => {
      const row = InventoryMapper.toRow({
        productId: 'p1',
        productName: 'Widget',
        sku: 'W-001',
        currentStock: 10,
      });

      expect(row.category).toBeNull();
      expect(row.minimum_stock).toBe(0);
      expect(row.location).toBeNull();
    });
  });

  describe('updateToRow', () => {
    it('only includes defined fields', () => {
      const row = InventoryMapper.updateToRow({ productName: 'New Name' });
      expect(row).toEqual({ product_name: 'New Name' });
      expect(row).not.toHaveProperty('sku');
    });

    it('returns empty object for empty DTO', () => {
      expect(InventoryMapper.updateToRow({})).toEqual({});
    });

    it('maps status enum', () => {
      const row = InventoryMapper.updateToRow({ status: StockStatus.DISCONTINUED });
      expect(row.status).toBe('discontinued');
    });
  });
});
