import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Send, CheckCircle, XCircle, ShoppingCart } from "lucide-react";
import { QuotationHistory as HistoryItem } from "@/pages/Quotations";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuotationHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: HistoryItem[];
  quotationNumber: string;
}

export function QuotationHistory({
  open,
  onOpenChange,
  history,
  quotationNumber,
}: QuotationHistoryProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const getActionIcon = (action: HistoryItem['action']) => {
    switch (action) {
      case 'created': return <Clock className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <XCircle className="w-4 h-4" />;
      case 'converted_to_sale': return <ShoppingCart className="w-4 h-4" />;
      default: return null;
    }
  };

  const getActionText = (action: HistoryItem['action']) => {
    const actionMap = {
      created: { ar: 'تم إنشاء العرض', en: 'Quotation created' },
      sent: { ar: 'تم إرسال العرض', en: 'Quotation sent' },
      accepted: { ar: 'تم قبول العرض', en: 'Quotation accepted' },
      expired: { ar: 'انتهت صلاحية العرض', en: 'Quotation expired' },
      converted_to_sale: { ar: 'تم تحويل العرض إلى بيع', en: 'Converted to sale' }
    };
    return actionMap[action]?.[isArabic ? 'ar' : 'en'] || action;
  };

  const getActionColor = (action: HistoryItem['action']) => {
    switch (action) {
      case 'created': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'sent': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'accepted': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'expired': return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'converted_to_sale': return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isArabic ? `تاريخ العرض - ${quotationNumber}` : `Quotation History - ${quotationNumber}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sortedHistory.map((item) => (
            <Card key={item.id} className="border-l-4 border-l-primary/30">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(item.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getActionColor(item.action)}>
                        {getActionText(item.action)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-sm text-muted-foreground">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {sortedHistory.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {isArabic ? "لا يوجد تاريخ لهذا العرض" : "No history available for this quotation"}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}