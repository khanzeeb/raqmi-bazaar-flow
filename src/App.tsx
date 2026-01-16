import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/Layout/AppLayout";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { UserSettingsProvider } from "@/contexts/UserSettingsContext";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import SalesOrders from "./pages/SalesOrders";
import Quotations from "./pages/Quotations";
import Purchases from "./pages/Purchases";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Payments from "./pages/Payments";
import Inventory from "./pages/Inventory";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import Invoices from "./pages/Invoices";
import Returns from "./pages/Returns";
import Monitoring from "./pages/Monitoring";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <UserSettingsProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/sales-orders" element={<SalesOrders />} />
              <Route path="/quotations" element={<Quotations />} />
              <Route path="/purchases" element={<Purchases />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/monitoring" element={<Monitoring />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
        </UserSettingsProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
