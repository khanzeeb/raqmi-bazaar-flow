import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  Archive, 
  AlertTriangle, 
  TrendingUp,
  BarChart3,
  Edit,
  Trash2,
  Download,
  Upload
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  unitCost: number;
  unitPrice: number;
  location: string;
  supplier: string;
  lastStockUpdate: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  notes?: string;
}

const Inventory = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  const [inventory] = useState<InventoryItem[]>([
    {
      id: '1',
      productId: 'PROD-001',
      productName: isArabic ? 'جهاز كمبيوتر محمول' : 'Laptop Computer',
      sku: 'LAP-HP-001',
      category: isArabic ? 'إلكترونيات' : 'Electronics',
      currentStock: 15,
      minimumStock: 5,
      maximumStock: 50,
      unitCost: 2000,
      unitPrice: 2500,
      location: isArabic ? 'المخزن الرئيسي - الرف A1' : 'Main Warehouse - Shelf A1',
      supplier: isArabic ? 'شركة التقنية المتقدمة' : 'Advanced Technology Co.',
      lastStockUpdate: '2024-01-20',
      status: 'in_stock'
    },
    {
      id: '2',
      productId: 'PROD-002',
      productName: isArabic ? 'طابعة ليزر' : 'Laser Printer',
      sku: 'PRT-HP-002',
      category: isArabic ? 'طابعات' : 'Printers',
      currentStock: 3,
      minimumStock: 5,
      maximumStock: 20,
      unitCost: 600,
      unitPrice: 800,
      location: isArabic ? 'المخزن الفرعي - الرف B2' : 'Secondary Warehouse - Shelf B2',
      supplier: isArabic ? 'مورد الطابعات' : 'Printer Supplier',
      lastStockUpdate: '2024-01-18',
      status: 'low_stock'
    },
    {
      id: '3',
      productId: 'PROD-003',
      productName: isArabic ? 'شاشة 24 بوصة' : '24-inch Monitor',
      sku: 'MON-SAM-003',
      category: isArabic ? 'شاشات' : 'Monitors',
      currentStock: 0,
      minimumStock: 3,
      maximumStock: 15,
      unitCost: 500,
      unitPrice: 600,
      location: isArabic ? 'المخزن الرئيسي - الرف C1' : 'Main Warehouse - Shelf C1',
      supplier: isArabic ? 'شركة الشاشات المتميزة' : 'Premium Monitors Co.',
      lastStockUpdate: '2024-01-15',
      status: 'out_of_stock'
    },
    {
      id: '4',
      productId: 'PROD-004',
      productName: isArabic ? 'ماوس لاسلكي' : 'Wireless Mouse',
      sku: 'MOU-LOG-004',
      category: isArabic ? 'إكسسوارات' : 'Accessories',
      currentStock: 45,
      minimumStock: 10,
      maximumStock: 100,
      unitCost: 30,
      unitPrice: 50,
      location: isArabic ? 'المخزن الفرعي - الرف D1' : 'Secondary Warehouse - Shelf D1',
      supplier: isArabic ? 'مورد الإكسسوارات' : 'Accessories Supplier',
      lastStockUpdate: '2024-01-22',
      status: 'in_stock'
    }
  ]);

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'low_stock': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'out_of_stock': return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'discontinued': return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getStatusText = (status: InventoryItem['status']) => {
    if (isArabic) {
      switch (status) {
        case 'in_stock': return 'متوفر';
        case 'low_stock': return 'مخزون قليل';
        case 'out_of_stock': return 'نفد المخزون';
        case 'discontinued': return 'متوقف';
        default: return status;
      }
    } else {
      switch (status) {
        case 'in_stock': return 'In Stock';
        case 'low_stock': return 'Low Stock';
        case 'out_of_stock': return 'Out of Stock';
        case 'discontinued': return 'Discontinued';
        default: return status;
      }
    }
  };

  const getStatusIcon = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock': return <Package className="w-4 h-4" />;
      case 'low_stock': return <AlertTriangle className="w-4 h-4" />;
      case 'out_of_stock': return <Archive className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate statistics
  const totalItems = inventory.reduce((sum, item) => sum + item.currentStock, 0);
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);
  const lowStockItems = inventory.filter(item => item.currentStock <= item.minimumStock).length;
  const outOfStockItems = inventory.filter(item => item.currentStock === 0).length;

  const categories = [...new Set(inventory.map(item => item.category))];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {isArabic ? 'إدارة المخزون' : 'Inventory Management'}
        </h1>
        <p className="text-muted-foreground">
          {isArabic ? 'تتبع وإدارة المخزون والمنتجات' : 'Track and manage inventory and products'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'إجمالي الأصناف' : 'Total Items'}
                </p>
                <p className="text-2xl font-bold">{totalItems.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'قيمة المخزون' : 'Inventory Value'}
                </p>
                <p className="text-2xl font-bold">{totalValue.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'مخزون قليل' : 'Low Stock'}
                </p>
                <p className="text-2xl font-bold">{lowStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                <Archive className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'نفد المخزون' : 'Out of Stock'}
                </p>
                <p className="text-2xl font-bold">{outOfStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory">
            {isArabic ? 'المخزون' : 'Inventory'}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            {isArabic ? 'التحليلات' : 'Analytics'}
          </TabsTrigger>
          <TabsTrigger value="movements">
            {isArabic ? 'حركة المخزون' : 'Stock Movements'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute ${isArabic ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4`} />
              <Input
                placeholder={isArabic ? "البحث بالمنتج أو الرمز أو المورد..." : "Search by product, SKU, or supplier..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isArabic ? "pr-10" : "pl-10"}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="all">{isArabic ? 'جميع الفئات' : 'All Categories'}</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</option>
                <option value="in_stock">{isArabic ? 'متوفر' : 'In Stock'}</option>
                <option value="low_stock">{isArabic ? 'مخزون قليل' : 'Low Stock'}</option>
                <option value="out_of_stock">{isArabic ? 'نفد المخزون' : 'Out of Stock'}</option>
              </select>
              
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                {isArabic ? 'تصدير' : 'Export'}
              </Button>
              
              <Button size="sm">
                <Plus className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                {isArabic ? 'إضافة منتج' : 'Add Product'}
              </Button>
            </div>
          </div>

          {/* Inventory Grid */}
          <div className="grid gap-4">
            {filteredInventory.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {item.productName}
                        {getStatusIcon(item.status)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isArabic ? 'الرمز:' : 'SKU:'} {item.sku} | {isArabic ? 'الفئة:' : 'Category:'} {item.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? 'المورد:' : 'Supplier:'} {item.supplier}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-col items-end">
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusText(item.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{isArabic ? 'المخزون الحالي' : 'Current Stock'}</p>
                      <p className="font-semibold text-lg">{item.currentStock}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isArabic ? 'الحد الأدنى' : 'Min Stock'}</p>
                      <p className="font-medium">{item.minimumStock}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isArabic ? 'سعر التكلفة' : 'Unit Cost'}</p>
                      <p className="font-medium">{item.unitCost.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isArabic ? 'سعر البيع' : 'Unit Price'}</p>
                      <p className="font-medium">{item.unitPrice.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isArabic ? 'القيمة الإجمالية' : 'Total Value'}</p>
                      <p className="font-medium">{(item.currentStock * item.unitCost).toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3 mb-4">
                    <p className="text-sm text-muted-foreground mb-1">{isArabic ? 'الموقع:' : 'Location:'}</p>
                    <p className="text-sm">{item.location}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isArabic ? 'آخر تحديث:' : 'Last updated:'} {item.lastStockUpdate}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button variant="outline" size="sm">
                      <Edit className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                      {isArabic ? 'تعديل' : 'Edit'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                      {isArabic ? 'تحديث المخزون' : 'Update Stock'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                      {isArabic ? 'التقرير' : 'Report'}
                    </Button>
                    {item.currentStock <= item.minimumStock && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        {isArabic ? 'طلب توريد' : 'Reorder'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredInventory.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {isArabic ? 'لا توجد منتجات مطابقة للبحث' : 'No products found matching your search'}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'تحليلات المخزون' : 'Inventory Analytics'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {isArabic ? 'تحليلات وتقارير المخزون قريباً...' : 'Inventory analytics and reports coming soon...'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'حركة المخزون' : 'Stock Movements'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {isArabic ? 'سجل حركة المخزون قريباً...' : 'Stock movement history coming soon...'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;