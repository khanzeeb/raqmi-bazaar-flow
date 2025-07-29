import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  Edit, 
  Trash2, 
  Eye,
  Grid3x3,
  List,
  Upload,
  Download
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductDialog } from "@/components/Products/ProductDialog";
import { ProductCard } from "@/components/Products/ProductCard";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  nameAr: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  image?: string;
  variants?: string[];
  barcode?: string;
}

// Sample data
const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Samsung Galaxy S24",
    nameAr: "سامسونج جالاكسي S24",
    sku: "SAM-S24-128",
    category: "Smartphones",
    price: 2999,
    stock: 15,
    status: 'active',
    variants: ['128GB', '256GB'],
    barcode: "1234567890123"
  },
  {
    id: "2",
    name: "Apple iPhone 15",
    nameAr: "آيفون 15",
    sku: "APL-IP15-128",
    category: "Smartphones", 
    price: 3499,
    stock: 8,
    status: 'active',
    variants: ['128GB', '256GB', '512GB'],
    barcode: "1234567890124"
  },
  {
    id: "3",
    name: "Sony WH-1000XM5",
    nameAr: "سوني WH-1000XM5",
    sku: "SNY-WH1000XM5",
    category: "Audio",
    price: 899,
    stock: 0,
    status: 'active',
    barcode: "1234567890125"
  }
];

interface ProductsProps {
  isArabic?: boolean;
}

export default function Products({ isArabic = false }: ProductsProps) {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [viewProductId, setViewProductId] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredProducts = products.filter(product => {
    // Text search
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.nameAr.includes(searchQuery) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    
    // Stock filter
    let matchesStock = true;
    if (stockFilter === "in-stock") {
      matchesStock = product.stock > 10;
    } else if (stockFilter === "low-stock") {
      matchesStock = product.stock > 0 && product.stock <= 10;
    } else if (stockFilter === "out-of-stock") {
      matchesStock = product.stock === 0;
    }
    
    return matchesSearch && matchesStatus && matchesStock;
  });

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsProductDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDialogOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    setDeleteProductId(productId);
  };

  const confirmDeleteProduct = () => {
    if (deleteProductId) {
      setProducts(products.filter(p => p.id !== deleteProductId));
      setDeleteProductId(null);
      toast({
        title: isArabic ? "تم حذف المنتج" : "Product deleted",
        description: isArabic ? "تم حذف المنتج بنجاح" : "Product has been deleted successfully",
      });
    }
  };

  const handleViewProduct = (productId: string) => {
    setViewProductId(productId);
  };

  const handleExportProducts = () => {
    const csvContent = [
      // Headers
      ['Name', 'Name (Arabic)', 'SKU', 'Category', 'Price', 'Stock', 'Status', 'Barcode'].join(','),
      // Data rows
      ...products.map(product => [
        `"${product.name}"`,
        `"${product.nameAr}"`,
        product.sku,
        product.category,
        product.price,
        product.stock,
        product.status,
        product.barcode || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'products.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    toast({
      title: isArabic ? "تم تصدير المنتجات" : "Products exported",
      description: isArabic ? "تم تصدير المنتجات إلى ملف CSV" : "Products have been exported to CSV file",
    });
  };

  const handleSaveProduct = (productData: Partial<Product>) => {
    if (selectedProduct) {
      // Edit existing product
      setProducts(products.map(p => 
        p.id === selectedProduct.id 
          ? { ...p, ...productData }
          : p
      ));
    } else {
      // Add new product
      const newProduct: Product = {
        id: Date.now().toString(),
        name: productData.name || '',
        nameAr: productData.nameAr || '',
        sku: productData.sku || '',
        category: productData.category || '',
        price: productData.price || 0,
        stock: productData.stock || 0,
        status: 'active',
        ...productData
      };
      setProducts([...products, newProduct]);
    }
    setIsProductDialogOpen(false);
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">{isArabic ? "نفد المخزون" : "Out of Stock"}</Badge>;
    } else if (stock < 10) {
      return <Badge variant="secondary" className="bg-warning/10 text-warning">{isArabic ? "مخزون منخفض" : "Low Stock"}</Badge>;
    }
    return <Badge variant="secondary" className="bg-success/10 text-success">{isArabic ? "متوفر" : "In Stock"}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isArabic ? "إدارة المنتجات" : "Product Management"}
            </h1>
            <p className="text-muted-foreground">
              {isArabic ? "إضافة وتحرير وإدارة منتجات المتجر" : "Add, edit and manage store products"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
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
          
          <Button variant="outline" size="sm" onClick={handleExportProducts}>
            <Download className="h-4 w-4 mr-2" />
            {isArabic ? "تصدير" : "Export"}
          </Button>
          
          <Button onClick={handleAddProduct} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {isArabic ? "منتج جديد" : "Add Product"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "إجمالي المنتجات" : "Total Products"}
                </p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "متوفر" : "In Stock"}
                </p>
                <p className="text-2xl font-bold">{products.filter(p => p.stock > 10).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "مخزون منخفض" : "Low Stock"}
                </p>
                <p className="text-2xl font-bold">{products.filter(p => p.stock > 0 && p.stock <= 10).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "نفد المخزون" : "Out of Stock"}
                </p>
                <p className="text-2xl font-bold">{products.filter(p => p.stock === 0).length}</p>
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
                placeholder={isArabic ? "البحث في المنتجات..." : "Search products..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={isArabic ? "الحالة" : "Status"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isArabic ? "كل الحالات" : "All Status"}</SelectItem>
                  <SelectItem value="active">{isArabic ? "نشط" : "Active"}</SelectItem>
                  <SelectItem value="inactive">{isArabic ? "غير نشط" : "Inactive"}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={isArabic ? "المخزون" : "Stock"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isArabic ? "كل المخزون" : "All Stock"}</SelectItem>
                  <SelectItem value="in-stock">{isArabic ? "متوفر" : "In Stock"}</SelectItem>
                  <SelectItem value="low-stock">{isArabic ? "مخزون منخفض" : "Low Stock"}</SelectItem>
                  <SelectItem value="out-of-stock">{isArabic ? "نفد المخزون" : "Out of Stock"}</SelectItem>
                </SelectContent>
              </Select>
              
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

      {/* Products Display */}
      {viewMode === 'list' ? (
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "قائمة المنتجات" : "Products List"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isArabic ? "المنتج" : "Product"}</TableHead>
                  <TableHead>{isArabic ? "رمز المنتج" : "SKU"}</TableHead>
                  <TableHead>{isArabic ? "الفئة" : "Category"}</TableHead>
                  <TableHead>{isArabic ? "السعر" : "Price"}</TableHead>
                  <TableHead>{isArabic ? "المخزون" : "Stock"}</TableHead>
                  <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                  <TableHead>{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p>{isArabic ? product.nameAr : product.name}</p>
                        {product.variants && (
                          <p className="text-xs text-muted-foreground">
                            {product.variants.join(', ')}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{isArabic ? `${product.price} ر.س` : `SAR ${product.price}`}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{getStockBadge(product.stock)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewProduct(product.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
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
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isArabic={isArabic}
              onView={() => handleViewProduct(product.id)}
              onEdit={() => handleEditProduct(product)}
              onDelete={() => handleDeleteProduct(product.id)}
            />
          ))}
        </div>
      )}

      {/* Product Dialog */}
      <ProductDialog
        open={isProductDialogOpen}
        onOpenChange={setIsProductDialogOpen}
        product={selectedProduct}
        onSave={handleSaveProduct}
        isArabic={isArabic}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isArabic ? "تأكيد الحذف" : "Confirm Deletion"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isArabic 
                ? "هل أنت متأكد من أنك تريد حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء."
                : "Are you sure you want to delete this product? This action cannot be undone."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {isArabic ? "إلغاء" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProduct} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isArabic ? "حذف" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Product Dialog */}
      <Dialog open={!!viewProductId} onOpenChange={() => setViewProductId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isArabic ? "تفاصيل المنتج" : "Product Details"}
            </DialogTitle>
          </DialogHeader>
          {viewProductId && (() => {
            const product = products.find(p => p.id === viewProductId);
            if (!product) return null;
            
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {isArabic ? "اسم المنتج" : "Product Name"}
                    </label>
                    <p className="text-sm">{isArabic ? product.nameAr : product.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {isArabic ? "رمز المنتج" : "SKU"}
                    </label>
                    <p className="text-sm font-mono">{product.sku}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {isArabic ? "الفئة" : "Category"}
                    </label>
                    <p className="text-sm">{product.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {isArabic ? "السعر" : "Price"}
                    </label>
                    <p className="text-sm">{isArabic ? `${product.price} ر.س` : `SAR ${product.price}`}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {isArabic ? "المخزون" : "Stock"}
                    </label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{product.stock}</p>
                      {getStockBadge(product.stock)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {isArabic ? "الحالة" : "Status"}
                    </label>
                    <p className="text-sm capitalize">{product.status}</p>
                  </div>
                  {product.barcode && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {isArabic ? "الرمز الشريطي" : "Barcode"}
                      </label>
                      <p className="text-sm font-mono">{product.barcode}</p>
                    </div>
                  )}
                </div>
                
                {product.variants && product.variants.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {isArabic ? "المتغيرات" : "Variants"}
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {product.variants.map((variant, index) => (
                        <Badge key={index} variant="outline">
                          {variant}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}