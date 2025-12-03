// Products Page - Refactored with separated hooks

import { useState, useCallback } from 'react';
import { useProductsData, useProductsActions, useProductsStats, useProductsState } from '@/hooks/products';
import { ProductView } from '@/types/product.types';
import { exportToCSV } from '@/lib/product/export';
import { useToast } from '@/hooks/use-toast';
import { useRTL } from '@/hooks/useRTL';

// Components
import { ProductHeader } from '@/components/Products/ProductHeader';
import { ProductStatsCards } from '@/components/Products/ProductStats';
import { ProductFilters, ViewMode } from '@/components/Products/ProductFilters';
import { ProductTable } from '@/components/Products/ProductTable';
import { ProductGrid } from '@/components/Products/ProductGrid';
import { ProductDialog } from '@/components/Products/ProductDialog';
import { ProductViewDialog } from '@/components/Products/ProductViewDialog';
import { ProductDeleteDialog } from '@/components/Products/ProductDeleteDialog';
import { ProductEmptyState, ProductLoadingState, ProductErrorState } from '@/components/Products/ProductEmptyState';

export default function Products() {
  const { toast } = useToast();
  const { isArabic, isRTL } = useRTL();

  // Data hook
  const {
    products,
    allProducts,
    loading,
    error,
    pagination,
    search,
    localFilters,
    updateSearch,
    updateLocalFilters,
    refresh
  } = useProductsData({ initialLimit: 50 });

  // Actions hook
  const { create, update, remove } = useProductsActions({ onSuccess: refresh });

  // Stats hook
  const stats = useProductsStats(allProducts);

  // State hook
  const { hasProducts, isEmpty } = useProductsState(allProducts, loading);

  // Local UI state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductView | null>(null);
  const [viewProduct, setViewProduct] = useState<ProductView | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  // Handlers
  const handleAdd = useCallback(() => {
    setSelectedProduct(null);
    setIsDialogOpen(true);
  }, []);

  const handleEdit = useCallback((product: ProductView) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  }, []);

  const handleView = useCallback((id: string) => {
    const product = products.find(p => p.id === id);
    if (product) setViewProduct(product);
  }, [products]);

  const handleDelete = useCallback((id: string) => {
    setDeleteProductId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteProductId) {
      const success = await remove(deleteProductId);
      if (success) setDeleteProductId(null);
    }
  }, [deleteProductId, remove]);

  const handleSave = useCallback(async (data: Partial<ProductView>) => {
    const success = selectedProduct
      ? await update(selectedProduct.id, data)
      : await create(data);
    
    if (success) setIsDialogOpen(false);
  }, [selectedProduct, create, update]);

  const handleExport = useCallback(() => {
    exportToCSV(allProducts, { isArabic });
    toast({
      title: isArabic ? 'تم تصدير المنتجات' : 'Products exported',
      description: isArabic ? 'تم تصدير المنتجات إلى ملف CSV' : 'Products have been exported to CSV file',
    });
  }, [allProducts, isArabic, toast]);

  // Render states
  if (loading && !hasProducts) {
    return (
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <ProductHeader onAdd={handleAdd} onExport={handleExport} loading={loading} isArabic={isArabic} />
        <ProductLoadingState isArabic={isArabic} />
      </div>
    );
  }

  if (error && !hasProducts) {
    return (
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <ProductHeader onAdd={handleAdd} onExport={handleExport} isArabic={isArabic} />
        <ProductErrorState error={error} isArabic={isArabic} />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <ProductHeader 
        onAdd={handleAdd} 
        onExport={handleExport} 
        loading={loading} 
        isArabic={isArabic} 
      />

      <ProductStatsCards 
        stats={stats} 
        loading={loading} 
        isArabic={isArabic} 
      />

      <ProductFilters
        search={search}
        onSearchChange={updateSearch}
        statusFilter={localFilters.status}
        onStatusChange={(v) => updateLocalFilters('status', v)}
        stockFilter={localFilters.stockStatus}
        onStockChange={(v) => updateLocalFilters('stockStatus', v)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isArabic={isArabic}
      />

      {isEmpty ? (
        <ProductEmptyState onAdd={handleAdd} isArabic={isArabic} />
      ) : viewMode === 'list' ? (
        <ProductTable
          products={products}
          isArabic={isArabic}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <ProductGrid
          products={products}
          isArabic={isArabic}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Dialogs */}
      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={selectedProduct}
        onSave={handleSave}
        isArabic={isArabic}
      />

      <ProductViewDialog
        open={!!viewProduct}
        onOpenChange={() => setViewProduct(null)}
        product={viewProduct}
        isArabic={isArabic}
      />

      <ProductDeleteDialog
        open={!!deleteProductId}
        onOpenChange={() => setDeleteProductId(null)}
        onConfirm={confirmDelete}
        loading={loading}
        isArabic={isArabic}
      />
    </div>
  );
}
