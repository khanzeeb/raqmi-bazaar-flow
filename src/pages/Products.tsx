// Products Page - Refactored with SOLID, KISS, DRY principles

import { useState, useCallback } from 'react';
import { useProductsRefactored } from '@/hooks/useProductsRefactored';
import { ProductView } from '@/types/product.types';
import { exportToCSV } from '@/lib/product/export';
import { useToast } from '@/hooks/use-toast';

// Components (Single Responsibility)
import { ProductHeader } from '@/components/Products/ProductHeader';
import { ProductStatsCards } from '@/components/Products/ProductStats';
import { ProductFilters, ViewMode } from '@/components/Products/ProductFilters';
import { ProductTable } from '@/components/Products/ProductTable';
import { ProductGrid } from '@/components/Products/ProductGrid';
import { ProductDialog } from '@/components/Products/ProductDialog';
import { ProductViewDialog } from '@/components/Products/ProductViewDialog';
import { ProductDeleteDialog } from '@/components/Products/ProductDeleteDialog';
import { ProductEmptyState, ProductLoadingState, ProductErrorState } from '@/components/Products/ProductEmptyState';

interface ProductsProps {
  isArabic?: boolean;
}

export default function Products({ isArabic = false }: ProductsProps) {
  const { toast } = useToast();
  
  // Hook handles all data fetching and state (Separation of Concerns)
  const {
    products,
    allProducts,
    loading,
    error,
    pagination,
    search,
    localFilters,
    stats,
    create,
    update,
    remove,
    updateSearch,
    updateLocalFilters,
    hasProducts,
    isEmpty,
  } = useProductsRefactored({ initialLimit: 50 });

  // Local UI state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductView | null>(null);
  const [viewProduct, setViewProduct] = useState<ProductView | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  // Handlers (KISS - Keep It Simple)
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

  // Render states (Single Responsibility for each state)
  if (loading && !hasProducts) {
    return (
      <div className="space-y-6">
        <ProductHeader onAdd={handleAdd} onExport={handleExport} loading={loading} isArabic={isArabic} />
        <ProductLoadingState isArabic={isArabic} />
      </div>
    );
  }

  if (error && !hasProducts) {
    return (
      <div className="space-y-6">
        <ProductHeader onAdd={handleAdd} onExport={handleExport} isArabic={isArabic} />
        <ProductErrorState error={error} isArabic={isArabic} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
