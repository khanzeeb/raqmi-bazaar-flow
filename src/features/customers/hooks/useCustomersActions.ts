import { Customer } from '@/types/customer.types';

export const useCustomersActions = (
  customers: Customer[],
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>
) => {
  const addCustomer = (customerData: Partial<Customer>) => {
    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: customerData.name || '',
      nameAr: customerData.nameAr || '',
      email: customerData.email || '',
      phone: customerData.phone || '',
      customerType: customerData.customerType || 'individual',
      status: 'active',
      balance: 0,
      lifetimeValue: 0,
      totalOrders: 0,
      billingAddress: customerData.billingAddress || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Saudi Arabia'
      },
      dateAdded: new Date().toISOString().split('T')[0],
      ...customerData
    };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => 
      c.id === id ? { ...c, ...customerData } : c
    ));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  return { addCustomer, updateCustomer, deleteCustomer };
};
