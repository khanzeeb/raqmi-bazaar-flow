import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useReturnsData, useReturnsFiltering, useReturnsStats, useReturnsActions } from "@/hooks/returns";
import { ReturnsFilters } from "@/components/Returns/ReturnsFilters";
import { ReturnsStatsCards } from "@/components/Returns/ReturnsStatsCards";
import { ReturnsTableView } from "@/components/Returns/ReturnsTableView";
import { ReturnDetailsDialog } from "@/components/Returns/ReturnDetailsDialog";
import { ReturnActionDialog } from "@/components/Returns/ReturnActionDialog";
import { NewReturnDialog } from "@/components/Returns/NewReturnDialog";
import { Return } from "@/types/return.types";

export default function Returns() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  const { returns, setReturns } = useReturnsData();
  const { filters, filteredReturns, setSearchTerm, setStatusFilter } = useReturnsFiltering(returns);
  const stats = useReturnsStats(returns);
  const { approveReturn, rejectReturn, completeReturn, addReturn } = useReturnsActions(returns, setReturns, isArabic);
  
  // Dialog states
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isNewReturnDialogOpen, setIsNewReturnDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | 'complete'>('approve');

  const handleViewDetails = (returnItem: Return) => {
    setSelectedReturn(returnItem);
    setIsDetailsDialogOpen(true);
  };

  const handleNewReturn = () => {
    setIsNewReturnDialogOpen(true);
  };

  const handleApprove = (returnItem: Return) => {
    setSelectedReturn(returnItem);
    setPendingAction('approve');
    setActionDialogOpen(true);
  };

  const handleReject = (returnItem: Return) => {
    setSelectedReturn(returnItem);
    setPendingAction('reject');
    setActionDialogOpen(true);
  };

  const handleComplete = (returnItem: Return) => {
    setSelectedReturn(returnItem);
    setPendingAction('complete');
    setActionDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedReturn) return;
    
    switch (pendingAction) {
      case 'approve':
        approveReturn(selectedReturn.id);
        break;
      case 'reject':
        rejectReturn(selectedReturn.id);
        break;
      case 'complete':
        completeReturn(selectedReturn.id);
        break;
    }
    
    setActionDialogOpen(false);
    setSelectedReturn(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {isArabic ? "المرتجعات" : "Returns"}
        </h1>
        <p className="text-muted-foreground">
          {isArabic ? "إدارة مرتجعات الطلبات" : "Manage order returns and refunds"}
        </p>
      </div>

      {/* Stats Cards */}
      <ReturnsStatsCards stats={stats} isArabic={isArabic} />

      {/* Filters */}
      <ReturnsFilters
        searchTerm={filters.searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={filters.statusFilter}
        onStatusChange={setStatusFilter}
        onNewReturn={handleNewReturn}
        isArabic={isArabic}
      />

      {/* Returns Table */}
      <ReturnsTableView
        returns={filteredReturns}
        isArabic={isArabic}
        onViewDetails={handleViewDetails}
        onApprove={handleApprove}
        onReject={handleReject}
        onComplete={handleComplete}
      />

      {/* Dialogs */}
      <ReturnDetailsDialog
        isOpen={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        returnData={selectedReturn}
      />

      <NewReturnDialog
        open={isNewReturnDialogOpen}
        onOpenChange={setIsNewReturnDialogOpen}
        onSubmit={addReturn}
        isArabic={isArabic}
      />

      <ReturnActionDialog
        open={actionDialogOpen}
        onOpenChange={setActionDialogOpen}
        returnItem={selectedReturn}
        action={pendingAction}
        onConfirm={handleConfirmAction}
        isArabic={isArabic}
      />
    </div>
  );
}
