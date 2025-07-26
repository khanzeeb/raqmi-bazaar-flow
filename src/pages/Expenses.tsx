import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Receipt, Car, Home, Zap, Calendar } from "lucide-react";

export interface Expense {
  id: string;
  expenseNumber: string;
  category: 'rent' | 'utilities' | 'transport' | 'office' | 'marketing' | 'maintenance' | 'other';
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'card';
  date: string;
  vendor?: string;
  receiptAttached: boolean;
  status: 'pending' | 'approved' | 'paid';
  notes?: string;
}

const Expenses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | Expense['category']>('all');
  const [expenses] = useState<Expense[]>([
    {
      id: '1',
      expenseNumber: 'EXP-001',
      category: 'rent',
      description: 'إيجار المحل - شهر يناير',
      amount: 5000,
      paymentMethod: 'bank_transfer',
      date: '2024-01-01',
      vendor: 'شركة العقارات المتحدة',
      receiptAttached: true,
      status: 'paid',
      notes: 'تم الدفع في المعاد المحدد'
    },
    {
      id: '2',
      expenseNumber: 'EXP-002',
      category: 'utilities',
      description: 'فاتورة الكهرباء',
      amount: 450,
      paymentMethod: 'card',
      date: '2024-01-15',
      vendor: 'الشركة السعودية للكهرباء',
      receiptAttached: true,
      status: 'paid'
    },
    {
      id: '3',
      expenseNumber: 'EXP-003',
      category: 'transport',
      description: 'وقود السيارات',
      amount: 300,
      paymentMethod: 'cash',
      date: '2024-01-16',
      receiptAttached: false,
      status: 'pending'
    },
    {
      id: '4',
      expenseNumber: 'EXP-004',
      category: 'office',
      description: 'مستلزمات مكتبية',
      amount: 150,
      paymentMethod: 'cash',
      date: '2024-01-17',
      vendor: 'مكتبة الرياض',
      receiptAttached: true,
      status: 'approved'
    }
  ]);

  const getCategoryColor = (category: Expense['category']) => {
    switch (category) {
      case 'rent': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'utilities': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'transport': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'office': return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      case 'marketing': return 'bg-pink-500/10 text-pink-700 border-pink-500/20';
      case 'maintenance': return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getCategoryText = (category: Expense['category']) => {
    switch (category) {
      case 'rent': return 'إيجار';
      case 'utilities': return 'مرافق';
      case 'transport': return 'مواصلات';
      case 'office': return 'مكتب';
      case 'marketing': return 'تسويق';
      case 'maintenance': return 'صيانة';
      case 'other': return 'أخرى';
      default: return category;
    }
  };

  const getCategoryIcon = (category: Expense['category']) => {
    switch (category) {
      case 'rent': return <Home className="w-4 h-4" />;
      case 'utilities': return <Zap className="w-4 h-4" />;
      case 'transport': return <Car className="w-4 h-4" />;
      case 'office': return <Receipt className="w-4 h-4" />;
      default: return <Receipt className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Expense['status']) => {
    switch (status) {
      case 'pending': return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'approved': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'paid': return 'bg-green-500/10 text-green-700 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getStatusText = (status: Expense['status']) => {
    switch (status) {
      case 'pending': return 'معلق';
      case 'approved': return 'معتمد';
      case 'paid': return 'مدفوع';
      default: return status;
    }
  };

  const getPaymentMethodText = (method: Expense['paymentMethod']) => {
    switch (method) {
      case 'cash': return 'نقدي';
      case 'bank_transfer': return 'تحويل بنكي';
      case 'card': return 'بطاقة';
      default: return method;
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.expenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">المصروفات</h1>
        <p className="text-muted-foreground">إدارة المصروفات والدفعات</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {totalExpenses.toLocaleString()} ر.س
            </div>
            <p className="text-sm text-muted-foreground">إجمالي المصروفات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {expenses.filter(e => e.status === 'pending').length}
            </div>
            <p className="text-sm text-muted-foreground">معلقة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {expenses.filter(e => e.status === 'paid').length}
            </div>
            <p className="text-sm text-muted-foreground">مدفوعة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {expenses.filter(e => e.receiptAttached).length}
            </div>
            <p className="text-sm text-muted-foreground">بإيصالات</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="البحث برقم المصروف أو الوصف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="all">جميع الفئات</option>
            <option value="rent">إيجار</option>
            <option value="utilities">مرافق</option>
            <option value="transport">مواصلات</option>
            <option value="office">مكتب</option>
            <option value="marketing">تسويق</option>
            <option value="maintenance">صيانة</option>
            <option value="other">أخرى</option>
          </select>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            مصروف جديد
          </Button>
        </div>
      </div>

      {/* Expenses Grid */}
      <div className="grid gap-4">
        {filteredExpenses.map((expense) => (
          <Card key={expense.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {expense.expenseNumber}
                    {getCategoryIcon(expense.category)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {expense.description}
                  </p>
                  {expense.vendor && (
                    <p className="text-xs text-muted-foreground">
                      المورد: {expense.vendor}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-col items-end">
                  <Badge className={getCategoryColor(expense.category)}>
                    {getCategoryText(expense.category)}
                  </Badge>
                  <Badge className={getStatusColor(expense.status)}>
                    {getStatusText(expense.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">المبلغ</p>
                  <p className="font-semibold text-lg">{expense.amount.toLocaleString()} ر.س</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">طريقة الدفع</p>
                  <p className="font-medium">{getPaymentMethodText(expense.paymentMethod)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">التاريخ</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {expense.date}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الإيصال</p>
                  <Badge variant={expense.receiptAttached ? 'default' : 'secondary'}>
                    {expense.receiptAttached ? 'مرفق' : 'غير مرفق'}
                  </Badge>
                </div>
              </div>
              
              {expense.notes && (
                <div className="border-t pt-3">
                  <p className="text-sm text-muted-foreground mb-1">ملاحظات:</p>
                  <p className="text-sm">{expense.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-3 border-t">
                <Button variant="outline" size="sm">
                  عرض التفاصيل
                </Button>
                <Button variant="outline" size="sm">
                  تعديل
                </Button>
                {!expense.receiptAttached && (
                  <Button variant="outline" size="sm">
                    إرفاق إيصال
                  </Button>
                )}
                {expense.status === 'pending' && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    اعتماد الدفع
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExpenses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">لا توجد مصروفات مطابقة للبحث</p>
        </div>
      )}
    </div>
  );
};

export default Expenses;