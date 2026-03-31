import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Loader2 } from "lucide-react";
import { SupplierDialog } from "@/components/Suppliers/SupplierDialog";
import { SupplierCard } from "@/components/Suppliers/SupplierCard";
import { SupplierFilters } from "@/components/Suppliers/SupplierFilters";
import { SupplierStats } from "@/components/Suppliers/SupplierStats";
import { useSuppliersData, useSuppliersFiltering, useSuppliersActions, useSuppliersStats } from "@/features/suppliers/hooks";
import { Supplier } from "@/types/supplier.types";
import { useRTL } from "@/hooks/useRTL";

export default function Suppliers() {
  const { isArabic, isRTL } = useRTL();
  const { suppliers, setSuppliers, isLoading, refetch } = useSuppliersData();
  const { filters, filteredSuppliers, setSearchQuery } = useSuppliersFiltering(suppliers);
  const { addSupplier, updateSupplier, deleteSupplier, isSubmitting } = useSuppliersActions(suppliers, setSuppliers, refetch);
  const stats = useSuppliersStats(suppliers);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const handleAdd = () => { setSelectedSupplier(null); setIsDialogOpen(true); };
  const handleEdit = (supplier: Supplier) => { setSelectedSupplier(supplier); setIsDialogOpen(true); };

  const handleSave = async (data: Partial<Supplier>) => {
    if (selectedSupplier) {
      await updateSupplier(selectedSupplier.id, data);
    } else {
      await addSupplier(data);
    }
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isArabic ? "إدارة الموردين" : "Supplier Management"}
            </h1>
            <p className="text-muted-foreground">
              {isArabic ? "إضافة وتحرير وإدارة بيانات الموردين" : "Add, edit and manage supplier information"}
            </p>
          </div>
        </div>
      </div>

      <SupplierStats stats={stats} isArabic={isArabic} />

      <Card>
        <CardContent className="p-4">
          <SupplierFilters
            searchQuery={filters.searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onAddSupplier={handleAdd}
            isArabic={isArabic}
          />
        </CardContent>
      </Card>

      {viewMode === 'list' ? (
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "قائمة الموردين" : "Suppliers List"}</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSuppliers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {isArabic ? "لا يوجد موردين" : "No suppliers found"}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSuppliers.map((supplier) => (
                  <SupplierCard
                    key={supplier.id}
                    supplier={supplier}
                    isArabic={isArabic}
                    onEdit={handleEdit}
                    onDelete={deleteSupplier}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              {isArabic ? "لا يوجد موردين" : "No suppliers found"}
            </div>
          ) : (
            filteredSuppliers.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                isArabic={isArabic}
                onEdit={handleEdit}
                onDelete={deleteSupplier}
              />
            ))
          )}
        </div>
      )}

      <SupplierDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        supplier={selectedSupplier}
        onSave={handleSave}
        isArabic={isArabic}
      />
    </div>
  );
}
