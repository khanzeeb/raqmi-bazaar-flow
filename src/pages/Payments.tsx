import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, Download, Eye, CreditCard, History, Users, AlertTriangle, Trash2, Edit } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PaymentDialog, Payment, CustomerCredit } from "@/components/Payments/PaymentDialog";
import { PaymentHistoryDialog } from "@/components/Payments/PaymentHistoryDialog";
import { CustomerCreditDialog } from "@/components/Payments/CustomerCreditDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const Payments = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { toast } = useToast();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | Payment['status']>('all');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string } | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  // Sample data
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: '1',
      paymentNumber: 'PAY-001',
      customerId: '1',
      customerName: 'أحمد محمد',
      amount: 2890,
      paymentMethod: 'cash',
      paymentDate: '2024-01-15',
      status: 'completed',
      reference: '',
      notes: 'دفعة كاملة لطلب SO-001',
      relatedOrderIds: ['1'],
      allocations: [
        {
          orderId: '1',
          orderNumber: 'SO-001',
          allocatedAmount: 2890,
          orderTotal: 2890,
          previouslyPaid: 0,
          remainingAfterPayment: 0
        }
      ],
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      paymentNumber: 'PAY-002',
      customerId: '2',
      customerName: 'شركة التقنية المتقدمة',
      amount: 1500,
      paymentMethod: 'bank_transfer',
      paymentDate: '2024-01-16',
      status: 'completed',
      reference: 'TXN-123456',
      notes: 'دفعة جزئية',
      relatedOrderIds: ['2'],
      allocations: [
        {
          orderId: '2',
          orderNumber: 'SO-002',
          allocatedAmount: 1500,
          orderTotal: 2760,
          previouslyPaid: 0,
          remainingAfterPayment: 1260
        }
      ],
      createdAt: '2024-01-16T14:30:00Z'
    }
  ]);

  const [customerCredits, setCustomerCredits] = useState<CustomerCredit[]>([
    {
      customerId: '1',
      customerName: 'أحمد محمد',
      creditLimit: 5000,
      availableCredit: 5000,
      usedCredit: 0,
      overdueAmount: 0,
      totalOutstanding: 0,
      creditStatus: 'good'
    },
    {
      customerId: '2',
      customerName: 'شركة التقنية المتقدمة',
      creditLimit: 10000,
      availableCredit: 8740,
      usedCredit: 1260,
      overdueAmount: 0,
      totalOutstanding: 1260,
      creditStatus: 'good'
    },
    {
      customerId: '3',
      customerName: 'فاطمة أحمد',
      creditLimit: 3000,
      availableCredit: 500,
      usedCredit: 2500,
      overdueAmount: 800,
      totalOutstanding: 3300,
      creditStatus: 'warning'
    }
  ]);

  const outstandingOrders = [
    {
      id: '2',
      orderNumber: 'SO-002',
      total: 2760,
      paidAmount: 1500,
      remainingAmount: 1260,
      dueDate: '2024-02-15',
      status: 'pending'
    },
    {
      id: '3',
      orderNumber: 'SO-003',
      total: 1200,
      paidAmount: 0,
      remainingAmount: 1200,
      dueDate: '2024-02-10',
      status: 'pending'
    }
  ];

  // Check if we came from customer page with specific customer data
  useEffect(() => {
    if (location.state?.action === 'newPayment' && location.state?.customerId) {
      const { customerId, customerName } = location.state;
      handleNewPaymentForCustomer(customerId, customerName);
      // Clear the state to prevent reopening
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'failed': return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'cancelled': return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getStatusText = (status: Payment['status']) => {
    const statusMap = {
      completed: { ar: 'مكتمل', en: 'Completed' },
      pending: { ar: 'معلق', en: 'Pending' },
      failed: { ar: 'فاشل', en: 'Failed' },
      cancelled: { ar: 'ملغى', en: 'Cancelled' }
    };
    return statusMap[status]?.[isArabic ? 'ar' : 'en'] || status;
  };

  const getPaymentMethodText = (method: Payment['paymentMethod']) => {
    const methodMap = {
      cash: { ar: 'نقدي', en: 'Cash' },
      bank_transfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
      credit: { ar: 'آجل', en: 'Credit' },
      check: { ar: 'شيك', en: 'Check' }
    };
    return methodMap[method]?.[isArabic ? 'ar' : 'en'] || method;
  };

  const getCreditStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'warning': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'blocked': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSavePayment = (paymentData: Partial<Payment>) => {
    if (selectedPayment && !isViewMode) {
      setPayments(payments.map(payment => 
        payment.id === selectedPayment.id 
          ? { ...payment, ...paymentData }
          : payment
      ));
    } else if (!isViewMode) {
      const newPayment: Payment = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...paymentData
      } as Payment;
      setPayments([newPayment, ...payments]);
    }
    setSelectedPayment(null);
    setIsPaymentDialogOpen(false);
    setIsViewMode(false);
    
    if (!isViewMode) {
      toast({
        title: isArabic ? "تم حفظ الدفعة" : "Payment saved",
        description: isArabic ? "تم حفظ الدفعة بنجاح" : "Payment has been saved successfully",
      });
    }
  };

  const handleDeletePayment = (payment: Payment) => {
    console.log('Attempting to delete payment:', payment);
    setPaymentToDelete(payment);
  };

  const confirmDeletePayment = () => {
    console.log('Confirming payment deletion:', paymentToDelete);
    if (paymentToDelete) {
      setPayments(payments.filter(p => p.id !== paymentToDelete.id));
      setPaymentToDelete(null);
      
      toast({
        title: isArabic ? "تم حذف الدفعة" : "Payment deleted",
        description: isArabic ? "تم حذف الدفعة بنجاح" : "Payment has been deleted successfully",
      });
    }
  };

  const canDeletePayment = (payment: Payment): boolean => {
    console.log('Checking if payment can be deleted:', payment.paymentNumber);
    // Only allow deletion if customer has no other credit or debit transactions
    const customerPayments = payments.filter(p => p.customerId === payment.customerId && p.id !== payment.id);
    const customerCredit = customerCredits.find(c => c.customerId === payment.customerId);
    
    const canDelete = customerPayments.length === 0 && (!customerCredit || (customerCredit.usedCredit === 0 && customerCredit.totalOutstanding === 0));
    console.log('Can delete payment:', canDelete, { customerPayments: customerPayments.length, customerCredit });
    return canDelete;
  };

  const handleViewPayment = (payment: Payment) => {
    console.log('Opening payment in view mode:', payment);
    setSelectedPayment(payment);
    setIsViewMode(true);
    setIsPaymentDialogOpen(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsViewMode(false);
    setIsPaymentDialogOpen(true);
  };

  const handleNewPaymentForCustomer = (customerId: string, customerName: string) => {
    setSelectedPayment(null);
    setIsViewMode(false);
    // Pre-fill customer information for new payment
    const customerCredit = customerCredits.find(c => c.customerId === customerId);
    const customerOutstandingOrders = outstandingOrders.filter(o => 
      // You would need to add customerId to orders, for now we'll use all outstanding orders
      true
    );
    
    // Pre-populate the payment dialog with customer info
    const preFilledPayment = {
      paymentNumber: `PAY-${Date.now().toString().slice(-6)}`,
      customerId: customerId,
      customerName: customerName,
      amount: 0,
      paymentMethod: 'cash' as const,
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'completed' as const,
      reference: '',
      notes: '',
      relatedOrderIds: [],
      allocations: [],
    };
    
    setSelectedPayment(preFilledPayment as any);
    setIsPaymentDialogOpen(true);
  };

  const handleSaveCustomerCredit = (creditData: Partial<CustomerCredit>) => {
    const existingIndex = customerCredits.findIndex(c => c.customerId === creditData.customerId);
    if (existingIndex >= 0) {
      setCustomerCredits(customerCredits.map((credit, index) => 
        index === existingIndex ? { ...credit, ...creditData } : credit
      ));
    } else {
      setCustomerCredits([...customerCredits, creditData as CustomerCredit]);
    }
    
    toast({
      title: isArabic ? "تم تحديث الائتمان" : "Credit updated",
      description: isArabic ? "تم تحديث إعدادات الائتمان بنجاح" : "Credit settings have been updated successfully",
    });
  };

  const handleViewPaymentHistory = (customerId: string, customerName: string) => {
    setSelectedCustomer({ id: customerId, name: customerName });
    setIsHistoryDialogOpen(true);
  };

  const handleManageCredit = (customerId: string, customerName: string) => {
    setSelectedCustomer({ id: customerId, name: customerName });
    setIsCreditDialogOpen(true);
  };

  const handleDownloadStatement = (customerId: string, fromDate: string, toDate: string) => {
    // Implementation for downloading customer statement
    toast({
      title: isArabic ? "جاري التحميل" : "Downloading",
      description: isArabic ? "جاري تحضير كشف الحساب" : "Preparing account statement",
    });
  };

  const totalPayments = filteredPayments.reduce((sum, payment) => 
    payment.status === 'completed' ? sum + payment.amount : sum, 0
  );

  const pendingPayments = filteredPayments.filter(p => p.status === 'pending').length;
  const totalOutstanding = customerCredits.reduce((sum, credit) => sum + credit.totalOutstanding, 0);
  const blockedCustomers = customerCredits.filter(c => c.creditStatus === 'blocked').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {isArabic ? "إدارة المدفوعات" : "Payment Management"}
        </h1>
        <p className="text-muted-foreground">
          {isArabic ? "إدارة المدفوعات وائتمان العملاء" : "Manage payments and customer credit"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isArabic ? "إجمالي المدفوعات" : "Total Payments"}</p>
                <p className="text-2xl font-bold">{totalPayments.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isArabic ? "دفعات معلقة" : "Pending Payments"}</p>
                <p className="text-2xl font-bold">{pendingPayments}</p>
              </div>
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <History className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isArabic ? "إجمالي المستحقات" : "Total Outstanding"}</p>
                <p className="text-2xl font-bold">{totalOutstanding.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</p>
              </div>
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isArabic ? "عملاء محظورين" : "Blocked Customers"}</p>
                <p className="text-2xl font-bold">{blockedCustomers}</p>
              </div>
              <div className="p-2 bg-gray-500/10 rounded-lg">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="payments">{isArabic ? "المدفوعات" : "Payments"}</TabsTrigger>
          <TabsTrigger value="credit">{isArabic ? "ائتمان العملاء" : "Customer Credit"}</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-6">
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={isArabic ? "البحث برقم الدفعة أو اسم العميل..." : "Search by payment number or customer name..."}
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
                <option value="all">{isArabic ? "جميع الحالات" : "All Status"}</option>
                <option value="completed">{isArabic ? "مكتمل" : "Completed"}</option>
                <option value="pending">{isArabic ? "معلق" : "Pending"}</option>
                <option value="failed">{isArabic ? "فاشل" : "Failed"}</option>
                <option value="cancelled">{isArabic ? "ملغى" : "Cancelled"}</option>
              </select>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
                <Button
                  onClick={() => {
                    setSelectedPayment(null);
                    setIsViewMode(false);
                    setIsPaymentDialogOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {isArabic ? "دفعة جديدة" : "New Payment"}
                </Button>
            </div>
          </div>

          {/* Payments Grid */}
          <div className="grid gap-4">
            {filteredPayments.map((payment) => (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{payment.paymentNumber}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {payment.customerName}
                        {payment.reference && ` - ${payment.reference}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusText(payment.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{isArabic ? "المبلغ" : "Amount"}</p>
                      <p className="font-semibold">{payment.amount.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isArabic ? "طريقة الدفع" : "Payment Method"}</p>
                      <p className="font-medium">{getPaymentMethodText(payment.paymentMethod)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isArabic ? "التاريخ" : "Date"}</p>
                      <p className="font-medium">{payment.paymentDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isArabic ? "الطلبات المرتبطة" : "Related Orders"}</p>
                      <p className="font-medium">{payment.allocations?.length || 0}</p>
                    </div>
                  </div>
                  
                  {/* Payment Allocations */}
                  {payment.allocations && payment.allocations.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-sm text-muted-foreground mb-2">
                        {isArabic ? "توزيع الدفعة:" : "Payment allocation:"}
                      </p>
                      <div className="space-y-1">
                        {payment.allocations.slice(0, 2).map((allocation) => (
                          <div key={allocation.orderId} className="flex justify-between text-sm">
                            <span>{allocation.orderNumber}</span>
                            <span>{allocation.allocatedAmount.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</span>
                          </div>
                        ))}
                        {payment.allocations.length > 2 && (
                          <p className="text-xs text-muted-foreground">
                            {isArabic 
                              ? `و ${payment.allocations.length - 2} طلب آخر...`
                              : `and ${payment.allocations.length - 2} more orders...`
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewPayment(payment)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {isArabic ? "عرض" : "View"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditPayment(payment)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      {isArabic ? "تعديل" : "Edit"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewPaymentHistory(payment.customerId, payment.customerName)}
                    >
                      <History className="w-4 h-4 mr-1" />
                      {isArabic ? "السجل" : "History"}
                    </Button>
                    {canDeletePayment(payment) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeletePayment(payment)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        {isArabic ? "حذف" : "Delete"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {isArabic ? "لا توجد مدفوعات مطابقة للبحث" : "No payments match your search"}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="credit" className="space-y-6">
          {/* Customer Credit Management */}
          <div className="grid gap-4">
            {customerCredits.map((credit) => (
              <Card key={credit.customerId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{credit.customerName}</h3>
                      <Badge className={getCreditStatusColor(credit.creditStatus)}>
                        {isArabic 
                          ? (credit.creditStatus === 'good' ? 'جيد' : 
                             credit.creditStatus === 'warning' ? 'تحذير' : 'محظور')
                          : credit.creditStatus
                        }
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{isArabic ? "حد الائتمان" : "Credit Limit"}</p>
                      <p className="font-semibold">{credit.creditLimit.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isArabic ? "الائتمان المتاح" : "Available Credit"}</p>
                      <p className="font-semibold text-green-600">{credit.availableCredit.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isArabic ? "الائتمان المستخدم" : "Used Credit"}</p>
                      <p className="font-semibold text-orange-600">{credit.usedCredit.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isArabic ? "المبلغ المتأخر" : "Overdue Amount"}</p>
                      <p className="font-semibold text-red-600">{credit.overdueAmount.toLocaleString()} {isArabic ? "ر.س" : "SAR"}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleNewPaymentForCustomer(credit.customerId, credit.customerName)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {isArabic ? "دفعة جديدة" : "New Payment"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleManageCredit(credit.customerId, credit.customerName)}
                    >
                      <CreditCard className="w-4 h-4 mr-1" />
                      {isArabic ? "إدارة الائتمان" : "Manage Credit"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewPaymentHistory(credit.customerId, credit.customerName)}
                    >
                      <History className="w-4 h-4 mr-1" />
                      {isArabic ? "سجل المدفوعات" : "Payment History"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <PaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={(open) => {
          setIsPaymentDialogOpen(open);
          if (!open) {
            setIsViewMode(false);
            setSelectedPayment(null);
          }
        }}
        payment={selectedPayment}
        onSave={handleSavePayment}
        isArabic={isArabic}
        isViewMode={isViewMode}
        customerCredit={selectedPayment ? customerCredits.find(c => c.customerId === selectedPayment.customerId) : undefined}
        outstandingOrders={outstandingOrders}
      />

      {selectedCustomer && (
        <>
          <PaymentHistoryDialog
            open={isHistoryDialogOpen}
            onOpenChange={setIsHistoryDialogOpen}
            customerId={selectedCustomer.id}
            customerName={selectedCustomer.name}
            payments={payments.filter(p => p.customerId === selectedCustomer.id)}
            isArabic={isArabic}
            onViewPayment={handleViewPayment}
            onDownloadStatement={handleDownloadStatement}
          />

          <CustomerCreditDialog
            open={isCreditDialogOpen}
            onOpenChange={setIsCreditDialogOpen}
            customerId={selectedCustomer.id}
            customerName={selectedCustomer.name}
            customerCredit={customerCredits.find(c => c.customerId === selectedCustomer.id)}
            onSave={handleSaveCustomerCredit}
            isArabic={isArabic}
          />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!paymentToDelete} onOpenChange={() => setPaymentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isArabic ? "تأكيد الحذف" : "Confirm Deletion"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isArabic 
                ? `هل أنت متأكد من حذف الدفعة ${paymentToDelete?.paymentNumber}؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete payment ${paymentToDelete?.paymentNumber}? This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPaymentToDelete(null)}>
              {isArabic ? "إلغاء" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeletePayment}
              className="bg-red-600 hover:bg-red-700"
            >
              {isArabic ? "حذف" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Payments;