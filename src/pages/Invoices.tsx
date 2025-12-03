// Invoices Page - Refactored with modular components
import React, { useState } from 'react';
import { useRTL } from "@/hooks/useRTL";
import { InvoiceDialog } from "@/components/Invoices/InvoiceDialog";
import { InvoiceViewDialog } from "@/components/Invoices/InvoiceViewDialog";
import { InvoicePDFDialog } from "@/components/Invoices/InvoicePDFDialog";
import { InvoiceSendDialog } from "@/components/Invoices/InvoiceSendDialog";
import { InvoicePaymentDialog } from "@/components/Invoices/InvoicePaymentDialog";
import { InvoiceQRDialog } from "@/components/Invoices/InvoiceQRDialog";
import { InvoiceCard } from "@/components/Invoices/InvoiceCard";
import { InvoiceFilters } from "@/components/Invoices/InvoiceFilters";
import { InvoiceStats } from "@/components/Invoices/InvoiceStats";
import { useInvoicesData, useInvoicesFiltering, useInvoicesActions, useInvoicesStats } from '@/hooks/invoices';
import { Invoice } from '@/types/invoice.types';
import { BilingualLabel } from "@/components/common/BilingualLabel";

const Invoices = () => {
  const { isArabic, isRTL } = useRTL();

  // Hooks
  const { invoices, updateStore, refresh } = useInvoicesData();
  const { search, localFilters, filteredInvoices, updateSearch, updateLocalFilters } = useInvoicesFiltering(invoices);
  const { create, update, markAsPaid } = useInvoicesActions({ updateStore, isArabic, onSuccess: refresh });
  const stats = useInvoicesStats(filteredInvoices);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>(undefined);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [dialogInvoice, setDialogInvoice] = useState<Invoice | null>(null);

  return (
    <div className="p-6 max-w-7xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          <BilingualLabel enLabel="Invoices" arLabel="الفواتير" showBoth={false} />
        </h1>
        <p className="text-muted-foreground">
          <BilingualLabel enLabel="Manage invoices and financial documents" arLabel="إدارة الفواتير والمستندات المالية" showBoth={false} />
        </p>
      </div>

      <InvoiceStats stats={stats} />

      <InvoiceFilters
        search={search}
        status={localFilters.status}
        onSearchChange={updateSearch}
        onStatusChange={(value) => updateLocalFilters('status', value)}
        onNewInvoice={() => { setSelectedInvoice(undefined); setIsDialogOpen(true); }}
      />

      <div className="grid gap-4">
        {filteredInvoices.map((invoice) => (
          <InvoiceCard
            key={invoice.id}
            invoice={invoice}
            onView={() => { setDialogInvoice(invoice); setViewDialogOpen(true); }}
            onPrint={() => window.print()}
            onDownload={() => { setDialogInvoice(invoice); setPdfDialogOpen(true); }}
            onSend={() => { setDialogInvoice(invoice); setSendDialogOpen(true); }}
            onMarkPaid={() => markAsPaid(invoice.id)}
          />
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{isArabic ? 'لا توجد فواتير مطابقة للبحث' : 'No invoices found matching your search'}</p>
        </div>
      )}

      {/* Dialogs */}
      <InvoiceDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} invoice={selectedInvoice} onSave={(data) => { selectedInvoice ? update(selectedInvoice.id, data) : create(data as Invoice); setIsDialogOpen(false); }} />
      {dialogInvoice && <InvoiceViewDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen} invoice={dialogInvoice} />}
      {dialogInvoice && <InvoicePDFDialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen} invoice={dialogInvoice} />}
      {dialogInvoice && <InvoiceSendDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen} invoice={dialogInvoice} />}
    </div>
  );
};

export default Invoices;
