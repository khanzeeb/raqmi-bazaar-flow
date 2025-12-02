import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { CustomerDialog } from "@/components/Customers/CustomerDialog";
import { CustomerCard } from "@/components/Customers/CustomerCard";
import { CustomerFilters } from "@/components/Customers/CustomerFilters";
import { CustomerStats } from "@/components/Customers/CustomerStats";
import { CustomerTable } from "@/components/Customers/CustomerTable";
import { useCustomersData, useCustomersFiltering, useCustomersActions, useCustomersStats } from "@/hooks/customers";
import { Customer } from "@/types/customer.types";

interface CustomersProps {
  isArabic?: boolean;
}

export default function Customers({ isArabic = false }: CustomersProps) {
  const navigate = useNavigate();
  const { customers, setCustomers } = useCustomersData();
  const { filters, filteredCustomers, setSearchQuery } = useCustomersFiltering(customers);
  const { addCustomer, updateCustomer, deleteCustomer } = useCustomersActions(customers, setCustomers);
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

  const handleSaveCustomer = (customerData: Partial<Customer>) => {
    if (selectedCustomer) {
      updateCustomer(selectedCustomer.id, customerData);
    } else {
      addCustomer(customerData);
    }
    setIsCustomerDialogOpen(false);
  };

  const handleNewPaymentForCustomer = (customer: Customer) => {
    navigate('/payments', { 
      state: { customerId: customer.id, customerName: customer.name, action: 'newPayment' } 
    });
  };

  return (
    <div className="space-y-6">
      <div className={`flex items-center justify-between ${isArabic ? 'rtl' : 'ltr'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className={isArabic ? 'text-right' : 'text-left'}>
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
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  isArabic={isArabic}
                  onEdit={handleEditCustomer}
                  onDelete={deleteCustomer}
                  onNewPayment={handleNewPaymentForCustomer}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              isArabic={isArabic}
              onEdit={handleEditCustomer}
              onDelete={deleteCustomer}
              onNewPayment={handleNewPaymentForCustomer}
            />
          ))}
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
