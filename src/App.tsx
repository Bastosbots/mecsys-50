
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AllChecklists from "./pages/AllChecklists";
import Budgets from "./pages/Budgets";
import ServicesTable from "./pages/ServicesTable";
import SystemSettings from "./pages/SystemSettings";
import UserManagement from "./pages/UserManagement";
import PublicChecklist from "./pages/PublicChecklist";
import NotFound from "./pages/NotFound";
import { Layout } from "./components/Layout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const AppContent = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public route - no authentication required */}
      <Route path="/public/checklist/:token" element={<PublicChecklist />} />
      
      {/* Protected routes */}
      <Route path="/*" element={
        !user || !profile ? (
          <Auth />
        ) : (
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/checklists" element={<AllChecklists />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/services" element={<ServicesTable />} />
              <Route path="/settings" element={<SystemSettings />} />
              <Route path="/system-settings" element={<SystemSettings />} />
              <Route path="/user-management" element={<UserManagement />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        )
      } />
    </Routes>
  );
};

export default App;
