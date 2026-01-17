import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell, 
  Search, 
  Globe, 
  Moon, 
  Sun, 
  User,
  ChevronDown,
  Settings,
  LogOut,
  Shield,
  Building2
} from "lucide-react";
import raqmiLogo from "@/assets/raqmi-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { OrganizationSwitcher, useOrganization, useRoleInfo } from "@/features/organization";
import { useAuth } from "@/features/auth";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface AppHeaderProps {
  isArabic: boolean;
  onLanguageToggle: () => void;
  onThemeToggle: () => void;
  isDark: boolean;
}

export function AppHeader({ isArabic, onLanguageToggle, onThemeToggle, isDark }: AppHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const { currentMembership, currentOrganization } = useOrganization();
  const { label: roleLabel } = useRoleInfo();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: isArabic ? "تم تسجيل الخروج" : "Signed out",
        description: isArabic 
          ? "تم تسجيل خروجك بنجاح. نراك قريباً!" 
          : "You have been successfully signed out. See you soon!",
      });
      navigate("/auth/login");
    } catch (error) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic 
          ? "حدث خطأ أثناء تسجيل الخروج" 
          : "An error occurred while signing out",
        variant: "destructive",
      });
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    const name = user?.name || currentMembership?.name || "User";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = user?.name || currentMembership?.name || "User";
  const displayEmail = user?.email || currentMembership?.email || "";

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
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => navigate("/notifications")}
          >
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
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={displayName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {displayName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {roleLabel ? (isArabic ? roleLabel.ar : roleLabel.en) : (isArabic ? "مدير المتجر" : "Store Manager")}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 z-50 bg-popover border border-border shadow-lg">
              {/* User info header */}
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-3 py-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar} alt={displayName} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate max-w-[160px]">
                      {displayEmail}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              
              {/* Current organization info */}
              {currentOrganization && (
                <>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      <span className="truncate">{currentOrganization.name}</span>
                    </div>
                    {roleLabel && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Shield className="h-3 w-3" />
                        <span>{isArabic ? roleLabel.ar : roleLabel.en}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              <DropdownMenuSeparator />
              
              {/* Menu items */}
              <DropdownMenuItem 
                onClick={() => navigate("/settings")}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                {isArabic ? "الملف الشخصي" : "Profile"}
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => navigate("/settings")}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                {isArabic ? "الإعدادات" : "Settings"}
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => navigate("/organization-settings")}
                className="cursor-pointer"
              >
                <Building2 className="mr-2 h-4 w-4" />
                {isArabic ? "إعدادات المنظمة" : "Organization Settings"}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleLogout}
                disabled={isLoading}
                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoading 
                  ? (isArabic ? "جاري الخروج..." : "Signing out...") 
                  : (isArabic ? "تسجيل الخروج" : "Sign out")
                }
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}