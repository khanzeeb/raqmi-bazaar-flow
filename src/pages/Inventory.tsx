import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, AlertTriangle, Archive, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useInventoryData, useInventoryFiltering, useInventoryStats } from "@/hooks/inventory";
import { InventoryFilters } from "@/components/Inventory/InventoryFilters";
import { InventoryStats } from "@/components/Inventory/InventoryStats";
import { InventoryCard } from "@/components/Inventory/InventoryCard";
import { InventoryEditDialog } from "@/components/Inventory/InventoryEditDialog";
import { StockUpdateDialog } from "@/components/Inventory/StockUpdateDialog";
import { ReorderDialog } from "@/components/Inventory/ReorderDialog";
import { InventoryReportDialog } from "@/components/Inventory/InventoryReportDialog";
import { InventoryItem } from "@/types/inventory.types";

const Inventory = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const isArabic = language === 'ar';
  
  const { inventory, setInventory } = useInventoryData();
  const { filters, filteredInventory, setSearchQuery, setCategory, setStatus } = useInventoryFiltering(inventory);
  const stats = useInventoryStats(inventory);
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [stockUpdateDialogOpen, setStockUpdateDialogOpen] = useState(false);
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const categories = [...new Set(inventory.map(item => item.category))];

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handleUpdateStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setStockUpdateDialogOpen(true);
  };

  const handleReorder = (item: InventoryItem) => {
    setSelectedItem(item);
    setReorderDialogOpen(true);
  };

  const handleViewReport = (item: InventoryItem) => {
    setSelectedItem(item);
    setReportDialogOpen(true);
  };

  const handleSaveItem = (updatedItem: InventoryItem) => {
    toast({
      title: isArabic ? 'تم التحديث' : 'Updated',
      description: isArabic ? 'تم تحديث بيانات المنتج بنجاح' : 'Product information updated successfully',
    });
  };

  const handleStockUpdate = (itemId: string, quantity: number, updateType: 'add' | 'remove' | 'set', reason: string) => {
    toast({
      title: isArabic ? 'تم تحديث المخزون' : 'Stock Updated',
      description: isArabic ? 'تم تحديث مستوى المخزون بنجاح' : 'Stock level updated successfully',
    });
  };

  const handleReorderSubmit = (itemId: string, quantity: number, notes: string) => {
    toast({
      title: isArabic ? 'تم إرسال الطلب' : 'Order Submitted',
      description: isArabic ? 'تم إرسال طلب التوريد بنجاح' : 'Reorder request submitted successfully',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {isArabic ? 'إدارة المخزون' : 'Inventory Management'}
        </h1>
        <p className="text-muted-foreground">
          {isArabic ? 'تتبع وإدارة المخزون والمنتجات' : 'Track and manage inventory and products'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'إجمالي الأصناف' : 'Total Items'}
                </p>
                <p className="text-2xl font-bold">{stats.totalItems.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'قيمة المخزون' : 'Inventory Value'}
                </p>
                <p className="text-2xl font-bold">{stats.totalValue.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'مخزون قليل' : 'Low Stock'}
                </p>
                <p className="text-2xl font-bold">{stats.lowStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                <Archive className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'نفد المخزون' : 'Out of Stock'}
                </p>
                <p className="text-2xl font-bold">{stats.outOfStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory">
            {isArabic ? 'المخزون' : 'Inventory'}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            {isArabic ? 'التحليلات' : 'Analytics'}
          </TabsTrigger>
          <TabsTrigger value="movements">
            {isArabic ? 'حركة المخزون' : 'Stock Movements'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          <InventoryFilters
            searchQuery={filters.searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={filters.category}
            onCategoryChange={setCategory}
            selectedStatus={filters.status}
            onStatusChange={setStatus}
            categories={categories}
            isArabic={isArabic}
          />

          <div className="grid gap-4">
            {filteredInventory.map((item) => (
              <InventoryCard
                key={item.id}
                item={item}
                isArabic={isArabic}
                onEdit={handleEditItem}
                onUpdateStock={handleUpdateStock}
                onReorder={handleReorder}
                onViewReport={handleViewReport}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'تحليلات المخزون' : 'Inventory Analytics'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {isArabic ? 'قريباً - تحليلات متقدمة للمخزون' : 'Coming soon - Advanced inventory analytics'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'حركة المخزون' : 'Stock Movements'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {isArabic ? 'قريباً - تتبع حركة المخزون' : 'Coming soon - Stock movement tracking'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedItem && (
        <>
          <InventoryEditDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            item={selectedItem}
            onSave={handleSaveItem}
            isArabic={isArabic}
          />
          <StockUpdateDialog
            open={stockUpdateDialogOpen}
            onOpenChange={setStockUpdateDialogOpen}
            item={selectedItem}
            onUpdate={handleStockUpdate}
            isArabic={isArabic}
          />
          <ReorderDialog
            open={reorderDialogOpen}
            onOpenChange={setReorderDialogOpen}
            item={selectedItem}
            onSubmit={handleReorderSubmit}
            isArabic={isArabic}
          />
          <InventoryReportDialog
            open={reportDialogOpen}
            onOpenChange={setReportDialogOpen}
            item={selectedItem}
            isArabic={isArabic}
          />
        </>
      )}
    </div>
  );
};

export default Inventory;
