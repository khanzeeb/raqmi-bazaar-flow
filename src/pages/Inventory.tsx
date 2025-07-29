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
  Upload,
  PieChart,
  Calendar,
  TrendingDown,
  Truck,
  ShoppingCart,
  DollarSign,
  Activity
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { InventoryEditDialog } from "@/components/Inventory/InventoryEditDialog";
import { StockUpdateDialog } from "@/components/Inventory/StockUpdateDialog";
import { ReorderDialog } from "@/components/Inventory/ReorderDialog";
import { InventoryReportDialog } from "@/components/Inventory/InventoryReportDialog";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const isArabic = language === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [stockUpdateDialogOpen, setStockUpdateDialogOpen] = useState(false);
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
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
    },
    {
      id: '5',
      productId: 'PROD-005',
      productName: isArabic ? 'لوحة مفاتيح مكتبية' : 'Desktop Keyboard',
      sku: 'KEY-LOX-005',
      category: isArabic ? 'إكسسوارات' : 'Accessories',
      currentStock: 23,
      minimumStock: 8,
      maximumStock: 60,
      unitCost: 80,
      unitPrice: 120,
      location: isArabic ? 'المخزن الرئيسي - الرف E1' : 'Main Warehouse - Shelf E1',
      supplier: isArabic ? 'مورد الإكسسوارات المكتبية' : 'Office Accessories Supplier',
      lastStockUpdate: '2024-01-21',
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

  // Dialog handlers
  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handleUpdateStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setStockUpdateDialogOpen(true);
  };

  const handleReorder = (item: InventoryItem) => {
    setSelectedItem(item);
    setReorderDialogOpen(true);
  };

  const handleViewReport = (item: InventoryItem) => {
    setSelectedItem(item);
    setReportDialogOpen(true);
  };

  const handleSaveItem = (updatedItem: InventoryItem) => {
    toast({
      title: isArabic ? 'تم التحديث' : 'Updated',
      description: isArabic ? 'تم تحديث بيانات المنتج بنجاح' : 'Product information updated successfully',
    });
  };

  const handleStockUpdate = (itemId: string, quantity: number, updateType: 'add' | 'remove' | 'set', reason: string) => {
    toast({
      title: isArabic ? 'تم تحديث المخزون' : 'Stock Updated',
      description: isArabic ? 'تم تحديث مستوى المخزون بنجاح' : 'Stock level updated successfully',
    });
  };

  const handleReorderSubmit = (itemId: string, quantity: number, notes: string) => {
    toast({
      title: isArabic ? 'تم إرسال الطلب' : 'Order Submitted',
      description: isArabic ? 'تم إرسال طلب التوريد بنجاح' : 'Reorder request submitted successfully',
    });
  };

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
                    <Button variant="outline" size="sm" onClick={() => handleEditItem(item)}>
                      <Edit className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                      {isArabic ? 'تعديل' : 'Edit'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleUpdateStock(item)}>
                      <Upload className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                      {isArabic ? 'تحديث المخزون' : 'Update Stock'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleViewReport(item)}>
                      <BarChart3 className={`w-4 h-4 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                      {isArabic ? 'التقرير' : 'Report'}
                    </Button>
                    {item.currentStock <= item.minimumStock && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleReorder(item)}>
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
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <PieChart className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'معدل دوران المخزون' : 'Inventory Turnover'}
                    </p>
                    <p className="text-2xl font-bold">4.2x</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'متوسط أيام التخزين' : 'Avg Days in Stock'}
                    </p>
                    <p className="text-2xl font-bold">87</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-cyan-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'هامش الربح المتوسط' : 'Avg Profit Margin'}
                    </p>
                    <p className="text-2xl font-bold">23%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? 'أداء الفئات' : 'Category Performance'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category, index) => {
                    const categoryItems = inventory.filter(item => item.category === category);
                    const categoryValue = categoryItems.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);
                    const percentage = (categoryValue / totalValue) * 100;
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{category}</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{categoryItems.length} {isArabic ? 'منتج' : 'items'}</span>
                          <span>{categoryValue.toLocaleString()} {isArabic ? 'ر.س' : 'SAR'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? 'تحليل المخزون' : 'Stock Analysis'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{isArabic ? 'مخزون صحي' : 'Healthy Stock'}</span>
                    </div>
                    <span className="font-medium">{inventory.filter(item => item.status === 'in_stock').length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">{isArabic ? 'مخزون منخفض' : 'Low Stock'}</span>
                    </div>
                    <span className="font-medium">{lowStockItems}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      <span className="text-sm">{isArabic ? 'نفد المخزون' : 'Out of Stock'}</span>
                    </div>
                    <span className="font-medium">{outOfStockItems}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="movements" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'إجمالي الواردات' : 'Total Inbound'}
                    </p>
                    <p className="text-2xl font-bold">1,247</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'إجمالي الصادرات' : 'Total Outbound'}
                    </p>
                    <p className="text-2xl font-bold">892</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Truck className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'طلبات التوريد' : 'Purchase Orders'}
                    </p>
                    <p className="text-2xl font-bold">34</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Activity className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'التعديلات' : 'Adjustments'}
                    </p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Movements */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'حركات المخزون الأخيرة' : 'Recent Stock Movements'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    type: 'inbound',
                    product: isArabic ? 'جهاز كمبيوتر محمول' : 'Laptop Computer',
                    quantity: 25,
                    reason: isArabic ? 'طلب توريد جديد' : 'New purchase order',
                    date: '2024-01-22',
                    user: isArabic ? 'أحمد محمد' : 'Ahmed Mohamed'
                  },
                  {
                    id: 2,
                    type: 'outbound',
                    product: isArabic ? 'طابعة ليزر' : 'Laser Printer',
                    quantity: 5,
                    reason: isArabic ? 'مبيعات العملاء' : 'Customer sales',
                    date: '2024-01-21',
                    user: isArabic ? 'فاطمة أحمد' : 'Fatima Ahmed'
                  },
                  {
                    id: 3,
                    type: 'adjustment',
                    product: isArabic ? 'ماوس لاسلكي' : 'Wireless Mouse',
                    quantity: -2,
                    reason: isArabic ? 'تعديل الجرد' : 'Inventory adjustment',
                    date: '2024-01-20',
                    user: isArabic ? 'محمد علي' : 'Mohamed Ali'
                  },
                  {
                    id: 4,
                    type: 'inbound',
                    product: isArabic ? 'لوحة مفاتيح مكتبية' : 'Desktop Keyboard',
                    quantity: 15,
                    reason: isArabic ? 'تجديد المخزون' : 'Stock replenishment',
                    date: '2024-01-19',
                    user: isArabic ? 'سارة حسن' : 'Sara Hassan'
                  }
                ].map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        movement.type === 'inbound' ? 'bg-green-500/10' :
                        movement.type === 'outbound' ? 'bg-red-500/10' : 'bg-blue-500/10'
                      }`}>
                        {movement.type === 'inbound' ? (
                          <TrendingUp className={`w-4 h-4 ${
                            movement.type === 'inbound' ? 'text-green-500' : 'text-red-500'
                          }`} />
                        ) : movement.type === 'outbound' ? (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        ) : (
                          <Edit className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{movement.product}</p>
                        <p className="text-sm text-muted-foreground">{movement.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </p>
                      <p className="text-xs text-muted-foreground">{movement.date}</p>
                      <p className="text-xs text-muted-foreground">{movement.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <InventoryEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        item={selectedItem}
        onSave={handleSaveItem}
      />
      
      <StockUpdateDialog
        open={stockUpdateDialogOpen}
        onOpenChange={setStockUpdateDialogOpen}
        item={selectedItem}
        onUpdate={handleStockUpdate}
      />
      
      <ReorderDialog
        open={reorderDialogOpen}
        onOpenChange={setReorderDialogOpen}
        item={selectedItem}
        onReorder={handleReorderSubmit}
      />
      
      <InventoryReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        item={selectedItem}
      />
    </div>
  );
};

export default Inventory;