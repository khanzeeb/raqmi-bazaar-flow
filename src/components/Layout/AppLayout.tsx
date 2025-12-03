import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { useLanguage } from "@/contexts/LanguageContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { language, toggleLanguage } = useLanguage();
  const [isDark, setIsDark] = useState(false);
  const isArabic = language === 'ar';

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

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
      <div className={`min-h-screen flex w-full bg-background ${isArabic ? 'flex-row-reverse' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
        {/* Sidebar moves to right side when Arabic is selected */}
        <AppSidebar isArabic={isArabic} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader 
            isArabic={isArabic}
            onLanguageToggle={toggleLanguage}
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