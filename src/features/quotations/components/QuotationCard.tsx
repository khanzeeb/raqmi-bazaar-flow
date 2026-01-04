import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Send, CheckCircle, Clock, XCircle, ShoppingCart, History, Printer, Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserSettings } from "@/contexts/UserSettingsContext";
import { Quotation } from "@/types/quotation.types";

interface QuotationCardProps {
  quotation: Quotation;
  onView: (id: string) => void;
  onSend: (id: string) => void;
  onAccept: (id: string) => void;
  onConvertToSale: (id: string) => void;
  onViewHistory: (quotation: Quotation) => void;
  onPrint: (quotation: Quotation) => void;
  onDownload: (quotation: Quotation) => void;
}

const getStatusColor = (status: Quotation['status']) => {
  const colors = {
    draft: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
    sent: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    accepted: 'bg-green-500/10 text-green-700 border-green-500/20',
    expired: 'bg-red-500/10 text-red-700 border-red-500/20',
  };
  return colors[status] || colors.draft;
};

const StatusIcon = ({ status }: { status: Quotation['status'] }) => {
  const icons = {
    draft: <Clock className="w-4 h-4" />,
    sent: <Send className="w-4 h-4" />,
    accepted: <CheckCircle className="w-4 h-4" />,
    expired: <XCircle className="w-4 h-4" />,
  };
  return icons[status] || null;
};

export const QuotationCard: React.FC<QuotationCardProps> = ({
  quotation,
  onView,
  onSend,
  onAccept,
  onConvertToSale,
  onViewHistory,
  onPrint,
  onDownload,
}) => {
  const { language, isRTL } = useLanguage();
  const { formatCurrency } = useUserSettings();
  const isArabic = language === 'ar';

  const statusText = {
    draft: { ar: 'مسودة', en: 'Draft' },
    sent: { ar: 'مرسل', en: 'Sent' },
    accepted: { ar: 'مقبول', en: 'Accepted' },
    expired: { ar: 'منتهي الصلاحية', en: 'Expired' },
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {quotation.quotationNumber}
              <StatusIcon status={quotation.status} />
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {quotation.customer.name} - {quotation.customer.phone}
            </p>
          </div>
          <Badge className={getStatusColor(quotation.status)}>
            {statusText[quotation.status]?.[isArabic ? 'ar' : 'en']}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? "المجموع" : "Total"}</p>
            <p className="font-semibold">{formatCurrency(quotation.total)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? "صالح حتى" : "Valid until"}</p>
            <p className="font-medium">{quotation.expiryDate}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? "مدة الصلاحية" : "Validity"}</p>
            <p className="font-medium">{quotation.validityDays} {isArabic ? "يوم" : "days"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{isArabic ? "التاريخ" : "Date"}</p>
            <p className="font-medium">{quotation.createdAt}</p>
          </div>
        </div>

        {/* Items Summary */}
        <div className="border-t pt-3">
          <p className="text-sm text-muted-foreground mb-2">
            {isArabic ? `العناصر (${quotation.items.length})` : `Items (${quotation.items.length})`}
          </p>
          <div className="space-y-1">
            {quotation.items.slice(0, 2).map((item) => (
              <div key={item.id} className={`flex justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{item.name} × {item.quantity}</span>
                <span>{formatCurrency(item.total)}</span>
              </div>
            ))}
            {quotation.items.length > 2 && (
              <p className="text-xs text-muted-foreground">
                {isArabic ? `و ${quotation.items.length - 2} عنصر آخر...` : `and ${quotation.items.length - 2} more items...`}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-3 border-t flex-wrap">
          <Button variant="outline" size="sm" onClick={() => onView(quotation.id)}>
            <Eye className="w-4 h-4 mr-1" />
            {isArabic ? "عرض" : "View"}
          </Button>
          {quotation.status === 'draft' && (
            <Button variant="outline" size="sm" onClick={() => onSend(quotation.id)}>
              <Send className="w-4 h-4 mr-1" />
              {isArabic ? "إرسال" : "Send"}
            </Button>
          )}
          {quotation.status === 'sent' && (
            <Button variant="outline" size="sm" onClick={() => onAccept(quotation.id)}>
              <CheckCircle className="w-4 h-4 mr-1" />
              {isArabic ? "قبول" : "Accept"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onViewHistory(quotation)}>
            <History className="w-4 h-4 mr-1" />
            {isArabic ? "السجل" : "History"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onPrint(quotation)}>
            <Printer className="w-4 h-4 mr-1" />
            {isArabic ? "طباعة" : "Print"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDownload(quotation)}>
            <Download className="w-4 h-4 mr-1" />
            {isArabic ? "تحميل" : "Download"}
          </Button>
          {quotation.status === 'accepted' && !quotation.convertedToSaleId && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onConvertToSale(quotation.id)}>
              <ShoppingCart className="w-4 h-4 mr-1" />
              {isArabic ? "تحويل لطلب بيع" : "Convert to Sale"}
            </Button>
          )}
          {quotation.convertedToSaleId && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {isArabic ? "تم التحويل" : "Converted"}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
