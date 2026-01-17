import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Loader2 } from "lucide-react";
import { CustomerDialog } from "@/components/Customers/CustomerDialog";
import { CustomerCard } from "@/components/Customers/CustomerCard";
import { CustomerFilters } from "@/components/Customers/CustomerFilters";
import { CustomerStats } from "@/components/Customers/CustomerStats";
import { useCustomersData, useCustomersFiltering, useCustomersActions, useCustomersStats } from "@/hooks/customers";
import { Customer } from "@/types/customer.types";
import { useRTL } from "@/hooks/useRTL";

export default function Customers() {
  const navigate = useNavigate();
  const { isArabic, isRTL } = useRTL();
  const { customers, setCustomers, isLoading, refetch } = useCustomersData();
  const { filters, filteredCustomers, setSearchQuery } = useCustomersFiltering(customers);
  const { addCustomer, updateCustomer, deleteCustomer, isSubmitting } = useCustomersActions(customers, setCustomers, refetch);
  const stats = useCustomersStats(customers);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsCustomerDialogOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsCustomerDialogOpen(true);
  };

  const handleSaveCustomer = async (customerData: Partial<Customer>) => {
    if (selectedCustomer) {
      await updateCustomer(selectedCustomer.id, customerData);
    } else {
      await addCustomer(customerData);
    }
    setIsCustomerDialogOpen(false);
  };

  const handleDeleteCustomer = async (id: string) => {
    await deleteCustomer(id);
  };

  const handleNewPaymentForCustomer = (customer: Customer) => {
    navigate('/payments', { 
      state: { customerId: customer.id, customerName: customer.name, action: 'newPayment' } 
    });
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
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isArabic ? "إدارة العملاء" : "Customer Management"}
            </h1>
            <p className="text-muted-foreground">
              {isArabic ? "إضافة وتحرير وإدارة بيانات العملاء" : "Add, edit and manage customer information"}
            </p>
          </div>
        </div>
      </div>

      <CustomerStats stats={stats} isArabic={isArabic} />

      <Card>
        <CardContent className="p-4">
          <CustomerFilters
            searchQuery={filters.searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onAddCustomer={handleAddCustomer}
            isArabic={isArabic}
          />
        </CardContent>
      </Card>

      {viewMode === 'list' ? (
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "قائمة العملاء" : "Customers List"}</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {isArabic ? "لا يوجد عملاء" : "No customers found"}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCustomers.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    isArabic={isArabic}
                    onEdit={handleEditCustomer}
                    onDelete={handleDeleteCustomer}
                    onNewPayment={handleNewPaymentForCustomer}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              {isArabic ? "لا يوجد عملاء" : "No customers found"}
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                isArabic={isArabic}
                onEdit={handleEditCustomer}
                onDelete={handleDeleteCustomer}
                onNewPayment={handleNewPaymentForCustomer}
              />
            ))
          )}
        </div>
      )}

      <CustomerDialog
        open={isCustomerDialogOpen}
        onOpenChange={setIsCustomerDialogOpen}
        customer={selectedCustomer}
        onSave={handleSaveCustomer}
        isArabic={isArabic}
      />
    </div>
  );
}
