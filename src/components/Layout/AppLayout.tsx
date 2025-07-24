import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isArabic, setIsArabic] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Initialize language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage === "ar") {
      setIsArabic(true);
      document.documentElement.setAttribute("dir", "rtl");
      document.documentElement.setAttribute("lang", "ar");
    }
  }, []);

  const handleLanguageToggle = () => {
    const newIsArabic = !isArabic;
    setIsArabic(newIsArabic);
    
    localStorage.setItem("language", newIsArabic ? "ar" : "en");
    document.documentElement.setAttribute("dir", newIsArabic ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", newIsArabic ? "ar" : "en");
  };

  const handleThemeToggle = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
    
    if (newIsDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar isArabic={isArabic} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader 
            isArabic={isArabic}
            onLanguageToggle={handleLanguageToggle}
            onThemeToggle={handleThemeToggle}
            isDark={isDark}
          />
          
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}