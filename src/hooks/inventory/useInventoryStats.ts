import { useMemo } from 'react';
import { InventoryItem, InventoryStats } from '@/types/inventory.types';

export const useInventoryStats = (inventory: InventoryItem[]): InventoryStats => {
  return useMemo(() => ({
    totalItems: inventory.reduce((sum, item) => sum + item.currentStock, 0),
    totalValue: inventory.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0),
    lowStockItems: inventory.filter(item => item.currentStock <= item.minimumStock).length,
    outOfStockItems: inventory.filter(item => item.currentStock === 0).length
  }), [inventory]);
};
