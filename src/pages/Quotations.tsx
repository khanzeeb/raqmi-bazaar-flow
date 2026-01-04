import React, { useState, useCallback } from 'react';
import { useRTL } from "@/hooks/useRTL";
import { BilingualLabel } from "@/components/common/BilingualLabel";
import { QuotationDialog } from "@/components/Quotations/QuotationDialog";
import { QuotationHistory } from "@/components/Quotations/QuotationHistory";
import { QuotationCard } from "@/components/Quotations/QuotationCard";
import { QuotationViewDialog } from "@/components/Quotations/QuotationViewDialog";
import { QuotationFilters } from "@/components/Quotations/QuotationFilters";
import { Quotation } from "@/types/quotation.types";
import { 
  useQuotationsData, 
  useQuotationsFiltering, 
  useQuotationsActions, 
  useQuotationsStats,
  useQuotationExport 
} from "@/hooks/quotations";

const Quotations = () => {
  const { isArabic, isRTL } = useRTL();

  // Hooks for data, filtering, actions
  const { quotations, loading, updateStore, refresh } = useQuotationsData();
  const { search, localFilters, filteredQuotations, updateSearch, updateLocalFilters } = useQuotationsFiltering(quotations);
  const { create, update, remove, send, accept, convertToSale } = useQuotationsActions({ updateStore, isArabic });
  const stats = useQuotationsStats(quotations);
  const { print, download } = useQuotationExport({ isArabic });

  // UI State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | undefined>();
  const [viewQuotation, setViewQuotation] = useState<Quotation | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyQuotation, setHistoryQuotation] = useState<Quotation | null>(null);

  // Handlers
  const handleNewQuotation = useCallback(() => {
    setSelectedQuotation(undefined);
    setIsDialogOpen(true);
  }, []);

  const handleView = useCallback((id: string) => {
    const quotation = quotations.find(q => q.id === id);
    if (quotation) setViewQuotation(quotation);
  }, [quotations]);

  const handleViewHistory = useCallback((quotation: Quotation) => {
    setHistoryQuotation(quotation);
    setIsHistoryOpen(true);
  }, []);

  const handleConvertToSale = useCallback(async (quotationId: string) => {
    await convertToSale(quotationId);
  }, [convertToSale]);

  const handleSave = useCallback((quotationData: Omit<Quotation, 'id' | 'createdAt'>) => {
    if (selectedQuotation) {
      update(selectedQuotation.id, quotationData);
    } else {
      create(quotationData);
    }
    setIsDialogOpen(false);
  }, [selectedQuotation, create, update]);

  return (
    <div className="p-6 max-w-7xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          <BilingualLabel enLabel="Quotations" arLabel="عروض الأسعار" showBoth={false} />
        </h1>
        <p className="text-muted-foreground">
          <BilingualLabel 
            enLabel="Manage quotations and convert to sales" 
            arLabel="إدارة عروض الأسعار والتحويل إلى مبيعات" 
            showBoth={false} 
          />
        </p>
      </div>

      {/* Filters */}
      <QuotationFilters
        search={search}
        status={localFilters.status}
        onSearchChange={updateSearch}
        onStatusChange={(value) => updateLocalFilters('status', value)}
        onNewQuotation={handleNewQuotation}
      />

      {/* Quotations Grid */}
      <div className="grid gap-4">
        {filteredQuotations.map((quotation) => (
          <QuotationCard
            key={quotation.id}
            quotation={quotation}
            onView={handleView}
            onSend={send}
            onAccept={accept}
            onConvertToSale={handleConvertToSale}
            onViewHistory={handleViewHistory}
            onPrint={print}
            onDownload={download}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredQuotations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {isArabic ? "لا توجد عروض أسعار مطابقة للبحث" : "No quotations match your search"}
          </p>
        </div>
      )}

      {/* Dialogs */}
      <QuotationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        quotation={selectedQuotation}
        onSave={handleSave}
      />

      <QuotationHistory
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        history={historyQuotation?.history || []}
        quotationNumber={historyQuotation?.quotationNumber || ''}
      />

      <QuotationViewDialog
        quotation={viewQuotation}
        open={!!viewQuotation}
        onOpenChange={(open) => !open && setViewQuotation(null)}
      />
    </div>
  );
};

export default Quotations;
