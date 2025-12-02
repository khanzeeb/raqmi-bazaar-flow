import { useState } from 'react';
import { InventoryItem } from '@/types/inventory.types';

export const useInventoryData = (isArabic: boolean) => {
  const [inventory] = useState<InventoryItem[]>([
    {
      id: '1',
      productId: 'PROD-001',
      productName: isArabic ? 'جهاز كمبيوتر محمول' : 'Laptop Computer',
      sku: 'LAP-HP-001',
      category: isArabic ? 'إلكترونيات' : 'Electronics',
      currentStock: 15,
      minimumStock: 5,
      maximumStock: 50,
      unitCost: 2000,
      unitPrice: 2500,
      location: isArabic ? 'المخزن الرئيسي - الرف A1' : 'Main Warehouse - Shelf A1',
      supplier: isArabic ? 'شركة التقنية المتقدمة' : 'Advanced Technology Co.',
      lastStockUpdate: '2024-01-20',
      status: 'in_stock'
    },
    {
      id: '2',
      productId: 'PROD-002',
      productName: isArabic ? 'طابعة ليزر' : 'Laser Printer',
      sku: 'PRT-HP-002',
      category: isArabic ? 'طابعات' : 'Printers',
      currentStock: 3,
      minimumStock: 5,
      maximumStock: 20,
      unitCost: 600,
      unitPrice: 800,
      location: isArabic ? 'المخزن الفرعي - الرف B2' : 'Secondary Warehouse - Shelf B2',
      supplier: isArabic ? 'مورد الطابعات' : 'Printer Supplier',
      lastStockUpdate: '2024-01-18',
      status: 'low_stock'
    },
    {
      id: '3',
      productId: 'PROD-003',
      productName: isArabic ? 'شاشة 24 بوصة' : '24-inch Monitor',
      sku: 'MON-SAM-003',
      category: isArabic ? 'شاشات' : 'Monitors',
      currentStock: 0,
      minimumStock: 3,
      maximumStock: 15,
      unitCost: 500,
      unitPrice: 600,
      location: isArabic ? 'المخزن الرئيسي - الرف C1' : 'Main Warehouse - Shelf C1',
      supplier: isArabic ? 'شركة الشاشات المتميزة' : 'Premium Monitors Co.',
      lastStockUpdate: '2024-01-15',
      status: 'out_of_stock'
    },
    {
      id: '4',
      productId: 'PROD-004',
      productName: isArabic ? 'ماوس لاسلكي' : 'Wireless Mouse',
      sku: 'MOU-LOG-004',
      category: isArabic ? 'إكسسوارات' : 'Accessories',
      currentStock: 45,
      minimumStock: 10,
      maximumStock: 100,
      unitCost: 30,
      unitPrice: 50,
      location: isArabic ? 'المخزن الفرعي - الرف D1' : 'Secondary Warehouse - Shelf D1',
      supplier: isArabic ? 'مورد الإكسسوارات' : 'Accessories Supplier',
      lastStockUpdate: '2024-01-22',
      status: 'in_stock'
    },
    {
      id: '5',
      productId: 'PROD-005',
      productName: isArabic ? 'لوحة مفاتيح مكتبية' : 'Desktop Keyboard',
      sku: 'KEY-LOX-005',
      category: isArabic ? 'إكسسوارات' : 'Accessories',
      currentStock: 23,
      minimumStock: 8,
      maximumStock: 60,
      unitCost: 80,
      unitPrice: 120,
      location: isArabic ? 'المخزن الرئيسي - الرف E1' : 'Main Warehouse - Shelf E1',
      supplier: isArabic ? 'مورد الإكسسوارات المكتبية' : 'Office Accessories Supplier',
      lastStockUpdate: '2024-01-21',
      status: 'in_stock'
    }
  ]);

  const categories = [...new Set(inventory.map(item => item.category))];

  return { inventory, categories };
};
