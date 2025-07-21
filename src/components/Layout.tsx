
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Menu } from 'lucide-react';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';

function MobileMenuButton() {
  const { toggleSidebar } = useSidebar();
  
  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed top-4 left-4 z-50 md:hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border shadow-lg hover:shadow-xl transition-shadow h-10 w-10 rounded-full"
      onClick={toggleSidebar}
    >
      <Menu className="h-4 w-4" />
    </Button>
  );
}

function DesktopMenuButton() {
  const { toggleSidebar } = useSidebar();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="mr-4 h-8 w-8"
    >
      <Menu className="h-4 w-4" />
    </Button>
  );
}

export function Layout() {
  const { data: settings } = useSystemSettings();
  const { profile } = useAuth();
  
  const systemName = settings?.system_name || 'Oficina Check';
  const systemDescription = settings?.system_description || 'Sistema de Gestão';
  const isAdmin = profile?.role === 'admin';
  const isMechanic = profile?.role === 'mechanic';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full no-horizontal-scroll mobile-text tap-highlight-none">
        <AppSidebar />
        
        {/* Botão hamburger flutuante para mobile */}
        <MobileMenuButton />
        
        <main className="flex-1 overflow-hidden h-screen-mobile">
          {/* Mobile Header - Otimizado para mecânicos */}
          <header className={`lg:hidden flex items-center justify-between px-3 py-2 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 safe-top ${isMechanic ? 'h-12' : 'h-14'}`}>
            <div className="flex items-center gap-2 flex-1 min-w-0 ml-12">
              <h1 className={`font-semibold truncate ${isMechanic ? 'text-sm' : 'text-base'}`}>
                {systemName}
              </h1>
            </div>
          </header>

          {/* Desktop Header - Mantido para admins */}
          <header className="hidden lg:flex h-14 items-center px-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <DesktopMenuButton />
            <div className="flex items-center gap-2">
              <h1 className={`font-semibold ${isAdmin ? 'text-sm' : 'text-lg'}`}>
                {systemName} - {systemDescription}
              </h1>
            </div>
          </header>
          
          {/* Main Content - Otimizado para mecânicos */}
          <div className={`flex-1 overflow-auto smooth-scroll safe-bottom ${isMechanic ? 'ios-bounce-fix android-scroll-fix' : ''}`}>
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
