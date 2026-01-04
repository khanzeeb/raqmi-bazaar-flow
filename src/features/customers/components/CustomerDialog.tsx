import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Plus } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  phone: string;
  customerType: 'individual' | 'business';
  status: 'active' | 'inactive';
  balance: number;
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

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onSave: (customer: Partial<Customer>) => void;
  isArabic?: boolean;
}

const customerTypes = [
  { value: 'individual', label: 'Individual', labelAr: 'فرد' },
  { value: 'business', label: 'Business', labelAr: 'شركة' }
];

const countries = [
  "Saudi Arabia",
  "United Arab Emirates",
  "Kuwait",
  "Qatar",
  "Bahrain",
  "Oman"
];

export function CustomerDialog({ open, onOpenChange, customer, onSave, isArabic = false }: CustomerDialogProps) {
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    nameAr: '',
    email: '',
    phone: '',
    customerType: 'individual',
    status: 'active',
    balance: 0,
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Saudi Arabia'
    },
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Saudi Arabia'
    },
    taxId: '',
    notes: '',
    tags: []
  });
  
  const [newTag, setNewTag] = useState('');
  const [sameAsBilling, setSameAsBilling] = useState(true);

  useEffect(() => {
    if (customer) {
      setFormData(customer);
      setSameAsBilling(!customer.shippingAddress || 
        JSON.stringify(customer.billingAddress) === JSON.stringify(customer.shippingAddress));
    } else {
      setFormData({
        name: '',
        nameAr: '',
        email: '',
        phone: '',
        customerType: 'individual',
        status: 'active',
        balance: 0,
        billingAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Saudi Arabia'
        },
        shippingAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Saudi Arabia'
        },
        taxId: '',
        notes: '',
        tags: []
      });
      setSameAsBilling(true);
    }
  }, [customer]);

  const handleSave = () => {
    const customerData = {
      ...formData,
      shippingAddress: sameAsBilling ? formData.billingAddress : formData.shippingAddress
    };
    onSave(customerData);
    onOpenChange(false);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((_, i) => i !== index) || []
    });
  };

  const updateBillingAddress = (field: string, value: string) => {
    const newBillingAddress = {
      ...formData.billingAddress!,
      [field]: value
    };
    setFormData({
      ...formData,
      billingAddress: newBillingAddress,
      shippingAddress: sameAsBilling ? newBillingAddress : formData.shippingAddress
    });
  };

  const updateShippingAddress = (field: string, value: string) => {
    setFormData({
      ...formData,
      shippingAddress: {
        ...formData.shippingAddress!,
        [field]: value
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customer 
              ? (isArabic ? "تحرير العميل" : "Edit Customer")
              : (isArabic ? "إضافة عميل جديد" : "Add New Customer")
            }
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">
              {isArabic ? "المعلومات الأساسية" : "Basic Info"}
            </TabsTrigger>
            <TabsTrigger value="address">
              {isArabic ? "العناوين" : "Addresses"}
            </TabsTrigger>
            <TabsTrigger value="additional">
              {isArabic ? "معلومات إضافية" : "Additional"}
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">
                  {isArabic ? "الاسم (إنجليزي)" : "Name (English)"}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={isArabic ? "أدخل الاسم" : "Enter name"}
                />
              </div>

              <div>
                <Label htmlFor="nameAr">
                  {isArabic ? "الاسم (عربي)" : "Name (Arabic)"}
                </Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder={isArabic ? "أدخل الاسم بالعربية" : "Enter name in Arabic"}
                />
              </div>

              <div>
                <Label htmlFor="email">
                  {isArabic ? "البريد الإلكتروني" : "Email"}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={isArabic ? "أدخل البريد الإلكتروني" : "Enter email"}
                />
              </div>

              <div>
                <Label htmlFor="phone">
                  {isArabic ? "رقم الهاتف" : "Phone Number"}
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={isArabic ? "أدخل رقم الهاتف" : "Enter phone number"}
                />
              </div>

              <div>
                <Label htmlFor="customerType">
                  {isArabic ? "نوع العميل" : "Customer Type"}
                </Label>
                <Select
                  value={formData.customerType}
                  onValueChange={(value: 'individual' | 'business') => 
                    setFormData({ ...formData, customerType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isArabic ? "اختر النوع" : "Select type"} />
                  </SelectTrigger>
                  <SelectContent>
                    {customerTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {isArabic ? type.labelAr : type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.customerType === 'business' && (
                <div>
                  <Label htmlFor="taxId">
                    {isArabic ? "الرقم الضريبي" : "Tax ID"}
                  </Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder={isArabic ? "أدخل الرقم الضريبي" : "Enter tax ID"}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="address" className="space-y-6">
            {/* Billing Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {isArabic ? "عنوان الفوترة" : "Billing Address"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="billingStreet">
                    {isArabic ? "الشارع" : "Street Address"}
                  </Label>
                  <Input
                    id="billingStreet"
                    value={formData.billingAddress?.street}
                    onChange={(e) => updateBillingAddress('street', e.target.value)}
                    placeholder={isArabic ? "أدخل عنوان الشارع" : "Enter street address"}
                  />
                </div>
                <div>
                  <Label htmlFor="billingCity">
                    {isArabic ? "المدينة" : "City"}
                  </Label>
                  <Input
                    id="billingCity"
                    value={formData.billingAddress?.city}
                    onChange={(e) => updateBillingAddress('city', e.target.value)}
                    placeholder={isArabic ? "أدخل المدينة" : "Enter city"}
                  />
                </div>
                <div>
                  <Label htmlFor="billingState">
                    {isArabic ? "المنطقة" : "State/Region"}
                  </Label>
                  <Input
                    id="billingState"
                    value={formData.billingAddress?.state}
                    onChange={(e) => updateBillingAddress('state', e.target.value)}
                    placeholder={isArabic ? "أدخل المنطقة" : "Enter state"}
                  />
                </div>
                <div>
                  <Label htmlFor="billingZip">
                    {isArabic ? "الرمز البريدي" : "ZIP Code"}
                  </Label>
                  <Input
                    id="billingZip"
                    value={formData.billingAddress?.zipCode}
                    onChange={(e) => updateBillingAddress('zipCode', e.target.value)}
                    placeholder={isArabic ? "أدخل الرمز البريدي" : "Enter ZIP code"}
                  />
                </div>
                <div>
                  <Label htmlFor="billingCountry">
                    {isArabic ? "البلد" : "Country"}
                  </Label>
                  <Select
                    value={formData.billingAddress?.country}
                    onValueChange={(value) => updateBillingAddress('country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {isArabic ? "عنوان التسليم" : "Shipping Address"}
                </h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sameAsbilling"
                    checked={sameAsBilling}
                    onChange={(e) => setSameAsBilling(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="sameAsBinding" className="text-sm">
                    {isArabic ? "نفس عنوان الفوترة" : "Same as billing"}
                  </Label>
                </div>
              </div>
              
              {!sameAsBilling && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="shippingStreet">
                      {isArabic ? "الشارع" : "Street Address"}
                    </Label>
                    <Input
                      id="shippingStreet"
                      value={formData.shippingAddress?.street}
                      onChange={(e) => updateShippingAddress('street', e.target.value)}
                      placeholder={isArabic ? "أدخل عنوان الشارع" : "Enter street address"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shippingCity">
                      {isArabic ? "المدينة" : "City"}
                    </Label>
                    <Input
                      id="shippingCity"
                      value={formData.shippingAddress?.city}
                      onChange={(e) => updateShippingAddress('city', e.target.value)}
                      placeholder={isArabic ? "أدخل المدينة" : "Enter city"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shippingState">
                      {isArabic ? "المنطقة" : "State/Region"}
                    </Label>
                    <Input
                      id="shippingState"
                      value={formData.shippingAddress?.state}
                      onChange={(e) => updateShippingAddress('state', e.target.value)}
                      placeholder={isArabic ? "أدخل المنطقة" : "Enter state"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shippingZip">
                      {isArabic ? "الرمز البريدي" : "ZIP Code"}
                    </Label>
                    <Input
                      id="shippingZip"
                      value={formData.shippingAddress?.zipCode}
                      onChange={(e) => updateShippingAddress('zipCode', e.target.value)}
                      placeholder={isArabic ? "أدخل الرمز البريدي" : "Enter ZIP code"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shippingCountry">
                      {isArabic ? "البلد" : "Country"}
                    </Label>
                    <Select
                      value={formData.shippingAddress?.country}
                      onValueChange={(value) => updateShippingAddress('country', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Additional Information Tab */}
          <TabsContent value="additional" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>
                  {isArabic ? "العلامات" : "Tags"}
                </Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder={isArabic ? "مثل: VIP، جملة، عادي" : "e.g. VIP, Wholesale, Regular"}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button variant="outline" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">
                  {isArabic ? "الملاحظات" : "Notes"}
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={isArabic ? "أدخل أي ملاحظات إضافية" : "Enter any additional notes"}
                  rows={4}
                />
              </div>

              {customer && (
                <div>
                  <Label htmlFor="balance">
                    {isArabic ? "الرصيد الحالي (ر.س)" : "Current Balance (SAR)"}
                  </Label>
                  <Input
                    id="balance"
                    type="number"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {isArabic ? "الأرقام الموجبة تعني رصيد للعميل، والسالبة تعني مستحقات" : "Positive numbers mean credit, negative means due"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isArabic ? "إلغاء" : "Cancel"}
          </Button>
          <Button onClick={handleSave}>
            {isArabic ? "حفظ العميل" : "Save Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}