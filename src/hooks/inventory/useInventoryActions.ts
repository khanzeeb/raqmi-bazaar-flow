import { InventoryItem } from '@/types/inventory.types';

export const useInventoryActions = (
  inventory: InventoryItem[],
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>
) => {
  const updateItem = (id: string, itemData: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, ...itemData } : item
    ));
  };

  const updateStock = (id: string, quantity: number, updateType: 'add' | 'remove' | 'set') => {
    setInventory(prev => prev.map(item => {
      if (item.id !== id) return item;
      
      let newStock = item.currentStock;
      switch (updateType) {
        case 'add':
          newStock = item.currentStock + quantity;
          break;
        case 'remove':
          newStock = Math.max(0, item.currentStock - quantity);
          break;
        case 'set':
          newStock = quantity;
          break;
      }
      
      let status: InventoryItem['status'] = 'in_stock';
      if (newStock === 0) status = 'out_of_stock';
      else if (newStock <= item.minimumStock) status = 'low_stock';
      
      return { ...item, currentStock: newStock, status, lastStockUpdate: new Date().toISOString().split('T')[0] };
    }));
  };

  const addItem = (itemData: Partial<InventoryItem>) => {
    const newItem: InventoryItem = {
      id: Date.now().toString(),
      productId: itemData.productId || '',
      productName: itemData.productName || '',
      sku: itemData.sku || '',
      category: itemData.category || '',
      currentStock: itemData.currentStock || 0,
      minimumStock: itemData.minimumStock || 0,
      maximumStock: itemData.maximumStock || 100,
      unitCost: itemData.unitCost || 0,
      unitPrice: itemData.unitPrice || 0,
      location: itemData.location || '',
      supplier: itemData.supplier || '',
      lastStockUpdate: new Date().toISOString().split('T')[0],
      status: 'in_stock',
      ...itemData
    };
    setInventory(prev => [...prev, newItem]);
    return newItem;
  };

  return { updateItem, updateStock, addItem };
};
