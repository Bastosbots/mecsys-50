

import { useAuth } from "@/hooks/useAuth"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Outlet } from "react-router-dom"
import { useSystemSettings } from "@/hooks/useSystemSettings"

export function Layout() {
  const { data: settings } = useSystemSettings();
  const { profile, user, loading } = useAuth();
  
  const systemName = settings?.system_name || 'Oficina Check';
  const systemDescription = settings?.system_description || 'Sistema de Gestão';
  const isAdmin = profile?.role === 'admin';
  const isMechanic = profile?.role === 'mechanic';
  
  // Se ainda está carregando, mostra uma tela de loading simples
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado (sem user OU sem profile), renderiza apenas o conteúdo principal sem sidebar
  if (!user || !profile) {
    return (
      <div className="min-h-screen w-full">
        <main className="flex-1 overflow-hidden h-screen">
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  // Se estiver autenticado, renderiza o layout completo com sidebar
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full no-horizontal-scroll mobile-text tap-highlight-none">
        <AppSidebar />
        <main className="flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

