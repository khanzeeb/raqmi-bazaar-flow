import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useReturnsData, useReturnsFiltering, useReturnsStats, useReturnsActions } from "@/hooks/returns";
import { ReturnsFilters } from "@/components/Returns/ReturnsFilters";
import { ReturnsStatsCards } from "@/components/Returns/ReturnsStatsCards";
import { ReturnsTableView } from "@/components/Returns/ReturnsTableView";
import { ReturnDetailsDialog } from "@/components/Returns/ReturnDetailsDialog";
import { Return } from "@/types/return.types";

export default function Returns() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  const { returns, setReturns } = useReturnsData();
  const { filters, filteredReturns, setSearchTerm, setStatusFilter } = useReturnsFiltering(returns);
  const stats = useReturnsStats(returns);
  const { approveReturn, rejectReturn, completeReturn } = useReturnsActions(returns, setReturns, isArabic);
  
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const handleViewDetails = (returnItem: Return) => {
    setSelectedReturn(returnItem);
    setIsDetailsDialogOpen(true);
  };

  const handleNewReturn = () => {
    // TODO: Open new return dialog
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
      />

      {/* Details Dialog */}
      <ReturnDetailsDialog
        isOpen={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        returnData={selectedReturn}
      />
    </div>
  );
}
