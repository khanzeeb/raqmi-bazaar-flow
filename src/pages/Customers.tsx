import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Edit, 
  Trash2, 
  Eye,
  Grid3x3,
  List,
  Upload,
  Download,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomerDialog } from "@/components/Customers/CustomerDialog";
import { CustomerCard } from "@/components/Customers/CustomerCard";

interface Customer {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  phone: string;
  customerType: 'individual' | 'business';
  status: 'active' | 'inactive';
  balance: number; // positive = credit, negative = due
  lifetimeValue: number;
  totalOrders: number;
  lastOrderDate?: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  taxId?: string;
  notes?: string;
  tags?: string[];
  dateAdded: string;
}

// Sample data
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

interface CustomersProps {
  isArabic?: boolean;
}

export default function Customers({ isArabic = false }: CustomersProps) {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.nameAr.includes(searchQuery) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsCustomerDialogOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsCustomerDialogOpen(true);
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers(customers.filter(c => c.id !== customerId));
  };

  const handleNewPaymentForCustomer = (customer: Customer) => {
    console.log('Creating new payment for customer:', customer);
    // Navigate to payments page and pass customer data via state
    navigate('/payments', { 
      state: { 
        customerId: customer.id, 
        customerName: customer.name,
        action: 'newPayment' 
      } 
    });
    console.log('Navigation called with state:', { customerId: customer.id, customerName: customer.name });
  };

  const handleSaveCustomer = (customerData: Partial<Customer>) => {
    if (selectedCustomer) {
      // Edit existing customer
      setCustomers(customers.map(c => 
        c.id === selectedCustomer.id 
          ? { ...c, ...customerData }
          : c
      ));
    } else {
      // Add new customer
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
      setCustomers([...customers, newCustomer]);
    }
    setIsCustomerDialogOpen(false);
  };

  const getBalanceBadge = (balance: number) => {
    if (balance > 0) {
      return <Badge variant="secondary" className="bg-success/10 text-success">{isArabic ? `رصيد ${balance} ر.س` : `Credit SAR ${balance}`}</Badge>;
    } else if (balance < 0) {
      return <Badge variant="secondary" className="bg-destructive/10 text-destructive">{isArabic ? `مستحق ${Math.abs(balance)} ر.س` : `Due SAR ${Math.abs(balance)}`}</Badge>;
    }
    return <Badge variant="secondary">{isArabic ? "متوازن" : "Balanced"}</Badge>;
  };

  const getCustomerTypeBadge = (type: string) => {
    return (
      <Badge variant="outline">
        {type === 'business' 
          ? (isArabic ? "شركة" : "Business")
          : (isArabic ? "فرد" : "Individual")
        }
      </Badge>
    );
  };

  // Statistics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const businessCustomers = customers.filter(c => c.customerType === 'business').length;
  const totalCredit = customers.filter(c => c.balance > 0).reduce((sum, c) => sum + c.balance, 0);
  const totalDue = customers.filter(c => c.balance < 0).reduce((sum, c) => sum + Math.abs(c.balance), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
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
        
          <div className={`flex items-center gap-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className={`h-4 w-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                  {isArabic ? "استيراد" : "Import"}
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Upload className="h-4 w-4 mr-2" />
                {isArabic ? "استيراد من Excel" : "Import from Excel"}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Upload className="h-4 w-4 mr-2" />
                {isArabic ? "استيراد من CSV" : "Import from CSV"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {isArabic ? "تصدير" : "Export"}
          </Button>
          
          <Button onClick={handleAddCustomer} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {isArabic ? "عميل جديد" : "Add Customer"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "إجمالي العملاء" : "Total Customers"}
                </p>
                <p className="text-2xl font-bold">{totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "نشط" : "Active"}
                </p>
                <p className="text-2xl font-bold">{activeCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "شركات" : "Business"}
                </p>
                <p className="text-2xl font-bold">{businessCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                <Plus className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "إجمالي الرصيد" : "Total Credit"}
                </p>
                <p className="text-2xl font-bold">{isArabic ? `${totalCredit} ر.س` : `SAR ${totalCredit}`}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "إجمالي المستحق" : "Total Due"}
                </p>
                <p className="text-2xl font-bold">{isArabic ? `${totalDue} ر.س` : `SAR ${totalDue}`}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={isArabic ? "البحث في العملاء..." : "Search customers..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {isArabic ? "تصفية" : "Filter"}
              </Button>
              
              <div className="flex rounded-lg border">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-l-none"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Display */}
      {viewMode === 'list' ? (
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "قائمة العملاء" : "Customers List"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isArabic ? "العميل" : "Customer"}</TableHead>
                  <TableHead>{isArabic ? "النوع" : "Type"}</TableHead>
                  <TableHead>{isArabic ? "الاتصال" : "Contact"}</TableHead>
                  <TableHead>{isArabic ? "الرصيد" : "Balance"}</TableHead>
                  <TableHead>{isArabic ? "إجمالي الطلبات" : "Total Orders"}</TableHead>
                  <TableHead>{isArabic ? "القيمة مدى الحياة" : "Lifetime Value"}</TableHead>
                  <TableHead>{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p>{isArabic ? customer.nameAr : customer.name}</p>
                        <div className="flex gap-1 mt-1">
                          {customer.tags?.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getCustomerTypeBadge(customer.customerType)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getBalanceBadge(customer.balance)}</TableCell>
                    <TableCell>{customer.totalOrders}</TableCell>
                    <TableCell>{isArabic ? `${customer.lifetimeValue} ر.س` : `SAR ${customer.lifetimeValue}`}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditCustomer(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            console.log('Payment button clicked in table for customer:', customer);
                            handleNewPaymentForCustomer(customer);
                          }}
                          title={isArabic ? "دفعة جديدة" : "New Payment"}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteCustomer(customer.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              isArabic={isArabic}
              onEdit={() => handleEditCustomer(customer)}
              onDelete={() => handleDeleteCustomer(customer.id)}
              onNewPayment={() => {
                console.log('Payment button clicked in grid for customer:', customer);
                handleNewPaymentForCustomer(customer);
              }}
            />
          ))}
        </div>
      )}

      {/* Customer Dialog */}
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