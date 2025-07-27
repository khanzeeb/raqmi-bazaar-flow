import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Download, Printer, Eye, Send, CheckCircle, Clock, XCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { QuotationDialog } from "@/components/Quotations/QuotationDialog";

export interface Quotation {
  id: string;
  quotationNumber: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    type: 'individual' | 'business';
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  discount: number;
  total: number;
  validityDays: number;
  expiryDate: string;
  status: 'draft' | 'sent' | 'accepted' | 'expired';
  createdAt: string;
  notes?: string;
}

const Quotations = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | Quotation['status']>('all');
  const [quotations, setQuotations] = useState<Quotation[]>([
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | undefined>(undefined);
    {
      id: '1',
      quotationNumber: 'QT-001',
      customer: { 
        name: 'أحمد محمد', 
        phone: '+966501234567', 
        email: 'ahmed@example.com',
        type: 'individual' 
      },
      items: [
        { id: '1', name: 'جهاز كمبيوتر محمول', quantity: 1, price: 2500, total: 2500 },
        { id: '2', name: 'ماوس لاسلكي', quantity: 2, price: 50, total: 100 }
      ],
      subtotal: 2600,
      taxRate: 15,
      taxAmount: 390,
      discount: 100,
      total: 2890,
      validityDays: 30,
      expiryDate: '2024-02-15',
      status: 'sent',
      createdAt: '2024-01-15',
      notes: 'عرض خاص للعميل المميز'
    },
    {
      id: '2',
      quotationNumber: 'QT-002',
      customer: { 
        name: 'شركة التقنية المتقدمة', 
        phone: '+966112345678',
        type: 'business' 
      },
      items: [
        { id: '3', name: 'طابعة ليزر', quantity: 5, price: 800, total: 4000 }
      ],
      subtotal: 4000,
      taxRate: 15,
      taxAmount: 600,
      discount: 200,
      total: 4400,
      validityDays: 15,
      expiryDate: '2024-02-01',
      status: 'draft',
      createdAt: '2024-01-16'
    }
  ]);

  const getStatusColor = (status: Quotation['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
      case 'sent': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'accepted': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'expired': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getStatusText = (status: Quotation['status']) => {
    const statusMap = {
      draft: { ar: 'مسودة', en: 'Draft' },
      sent: { ar: 'مرسل', en: 'Sent' },
      accepted: { ar: 'مقبول', en: 'Accepted' },
      expired: { ar: 'منتهي الصلاحية', en: 'Expired' }
    };
    return statusMap[status]?.ar || status;
  };

  const getStatusIcon = (status: Quotation['status']) => {
    switch (status) {
      case 'draft': return <Clock className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || quotation.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">عروض الأسعار</h1>
        <p className="text-muted-foreground">إدارة عروض الأسعار والتحويل إلى مبيعات</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="البحث برقم العرض أو اسم العميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="all">جميع الحالات</option>
            <option value="draft">مسودة</option>
            <option value="sent">مرسل</option>
            <option value="accepted">مقبول</option>
            <option value="expired">منتهي الصلاحية</option>
          </select>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <Button 
            className="flex items-center gap-2"
            onClick={() => {
              setSelectedQuotation(undefined);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            عرض سعر جديد
          </Button>
        </div>
      </div>

      {/* Quotations Grid */}
      <div className="grid gap-4">
        {filteredQuotations.map((quotation) => (
          <Card key={quotation.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {quotation.quotationNumber}
                    {getStatusIcon(quotation.status)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {quotation.customer.name}
                    {quotation.customer.phone && ` - ${quotation.customer.phone}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(quotation.status)}>
                    {getStatusText(quotation.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">المجموع</p>
                  <p className="font-semibold">{quotation.total.toLocaleString()} ر.س</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">صالح حتى</p>
                  <p className="font-medium">{quotation.expiryDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">مدة الصلاحية</p>
                  <p className="font-medium">{quotation.validityDays} يوم</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">التاريخ</p>
                  <p className="font-medium">{quotation.createdAt}</p>
                </div>
              </div>
              
              {/* Items Summary */}
              <div className="border-t pt-3">
                <p className="text-sm text-muted-foreground mb-2">العناصر ({quotation.items.length})</p>
                <div className="space-y-1">
                  {quotation.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{item.total.toLocaleString()} ر.س</span>
                    </div>
                  ))}
                  {quotation.items.length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      و {quotation.items.length - 2} عنصر آخر...
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-3 border-t">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  عرض
                </Button>
                <Button variant="outline" size="sm">
                  <Send className="w-4 h-4 mr-1" />
                  إرسال
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-1" />
                  طباعة
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  تحميل PDF
                </Button>
                {quotation.status === 'accepted' && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    تحويل لطلب بيع
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuotations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">لا توجد عروض أسعار مطابقة للبحث</p>
        </div>
      )}
    </div>
  );
};

export default Quotations;