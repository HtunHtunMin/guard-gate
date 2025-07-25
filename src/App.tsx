import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import Permissions from "./pages/Permissions";
import Teams from "./pages/Teams";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/users" element={
            <ProtectedRoute permission="view_users">
              <DashboardLayout>
                <Users />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/roles" element={
            <ProtectedRoute permission="view_roles">
              <DashboardLayout>
                <Roles />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/permissions" element={
            <ProtectedRoute permission="view_permissions">
              <DashboardLayout>
                <Permissions />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/teams" element={
            <ProtectedRoute permission="view_teams">
              <DashboardLayout>
                <Teams />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
