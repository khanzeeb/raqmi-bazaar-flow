import { useState } from 'react';
import { Customer } from '@/types/customer.types';

const sampleCustomers: Customer[] = [
  {
    id: "1",
    name: "Ahmed Al-Rashid",
    nameAr: "أحمد الراشد",
    email: "ahmed@example.com",
    phone: "+966501234567",
    customerType: 'individual',
    status: 'active',
    balance: 1500,
    lifetimeValue: 25430,
    totalOrders: 12,
    lastOrderDate: "2024-01-15",
    billingAddress: {
      street: "King Fahd Road, District 123",
      city: "Riyadh",
      state: "Riyadh",
      zipCode: "12345",
      country: "Saudi Arabia"
    },
    tags: ["VIP", "Regular"],
    dateAdded: "2023-06-15"
  },
  {
    id: "2",
    name: "Fatima Trading LLC",
    nameAr: "شركة فاطمة التجارية",
    email: "info@fatimatrading.com",
    phone: "+966502345678",
    customerType: 'business',
    status: 'active',
    balance: -2300,
    lifetimeValue: 45600,
    totalOrders: 28,
    lastOrderDate: "2024-01-20",
    billingAddress: {
      street: "Al-Olaya District, Office Complex",
      city: "Riyadh",
      state: "Riyadh",
      zipCode: "11564",
      country: "Saudi Arabia"
    },
    taxId: "300123456789003",
    tags: ["Wholesale", "Corporate"],
    dateAdded: "2023-03-22"
  },
  {
    id: "3",
    name: "Sara Mohammed",
    nameAr: "سارة محمد",
    email: "sara.mohammed@email.com",
    phone: "+966503456789",
    customerType: 'individual',
    status: 'active',
    balance: 0,
    lifetimeValue: 8750,
    totalOrders: 5,
    lastOrderDate: "2024-01-10",
    billingAddress: {
      street: "Al-Malaz District",
      city: "Riyadh",
      state: "Riyadh",
      zipCode: "11453",
      country: "Saudi Arabia"
    },
    tags: ["New Customer"],
    dateAdded: "2024-01-01"
  }
];

export const useCustomersData = () => {
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers);

  return { customers, setCustomers };
};
