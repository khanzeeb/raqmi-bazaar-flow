import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Search, 
  Globe, 
  Moon, 
  Sun, 
  User,
  ChevronDown
} from "lucide-react";
import raqmiLogo from "@/assets/raqmi-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { OrganizationSwitcher, useOrganization, useRoleInfo } from "@/features/organization";
import { Separator } from "@/components/ui/separator";

interface AppHeaderProps {
  isArabic: boolean;
  onLanguageToggle: () => void;
  onThemeToggle: () => void;
  isDark: boolean;
}

export function AppHeader({ isArabic, onLanguageToggle, onThemeToggle, isDark }: AppHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { currentMembership } = useOrganization();
  const { label: roleLabel } = useRoleInfo();

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left side - Sidebar trigger, logo, org switcher, and search */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          
          {/* Company Logo */}
          <div className="flex items-center gap-2">
            <img 
              src={raqmiLogo} 
              alt="RaqmiStore Logo" 
              className="h-8 w-8 object-contain"
            />
            <span className="font-bold text-foreground hidden sm:block">
              {isArabic ? "متجر رقمي" : "RaqmiStore"}
            </span>
          </div>

          {/* Organization Switcher */}
          <Separator orientation="vertical" className="h-8 hidden md:block" />
          <div className="hidden md:block">
            <OrganizationSwitcher />
          </div>
          
          <div className="relative w-80 hidden lg:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder={isArabic ? "البحث في المنتجات، العملاء..." : "Search products, customers..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-border focus:bg-background"
            />
          </div>
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center gap-3">
          {/* Quick stats */}
          <div className="hidden xl:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {isArabic ? "مبيعات اليوم:" : "Today's Sales:"}
              </span>
              <Badge variant="secondary" className="bg-success/10 text-success">
                {isArabic ? "ر.س 12,450" : "SAR 12,450"}
              </Badge>
            </div>
            <div className="h-4 w-px bg-border"></div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {isArabic ? "أوامر معلقة:" : "Pending Orders:"}
              </span>
              <Badge variant="secondary" className="bg-warning/10 text-warning">
                8
              </Badge>
            </div>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
              3
            </Badge>
          </Button>

          {/* Language toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onLanguageToggle}
            className="text-muted-foreground hover:text-foreground"
          >
            <Globe className="h-5 w-5" />
          </Button>

          {/* Theme toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onThemeToggle}
            className="text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {currentMembership?.name || "Ahmed Al-Rashid"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {roleLabel ? (isArabic ? roleLabel.ar : roleLabel.en) : (isArabic ? "مدير المتجر" : "Store Manager")}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                {isArabic ? "الملف الشخصي" : "Profile"}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                {isArabic ? "الإشعارات" : "Notifications"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                {isArabic ? "تسجيل الخروج" : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}