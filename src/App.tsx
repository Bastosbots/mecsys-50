
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/hooks/useAuth"
import { Layout } from "./components/Layout"
import Index from "./pages/Index"
import Auth from "./pages/Auth"
import Dashboard from "./pages/Dashboard"
import AllChecklists from "./pages/AllChecklists"
import Budgets from "./pages/Budgets"
import ServicesTable from "./pages/ServicesTable"
import UserManagement from "./pages/UserManagement"
import SystemSettings from "./pages/SystemSettings"
import Register from "./pages/Register"
import Signup from "./pages/Signup"
import PublicChecklist from "./pages/PublicChecklist"
import PublicBudget from "./pages/PublicBudget"
import NotFound from "./pages/NotFound"

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light">
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/register" element={<Register />} />
              <Route path="/signup/:token" element={<Signup />} />
              <Route path="/public/checklist/:token" element={<PublicChecklist />} />
              <Route path="/public/budget/:token" element={<PublicBudget />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="checklists" element={<AllChecklists />} />
                <Route path="budgets" element={<Budgets />} />
                <Route path="services" element={<ServicesTable />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="user-management" element={<UserManagement />} />
                <Route path="settings" element={<SystemSettings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
)

export default App
