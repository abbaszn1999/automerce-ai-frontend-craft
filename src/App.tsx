import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Workspaces from "./pages/Workspaces";
import NotFound from "./pages/NotFound";
import ProductInput from "./pages/ProductInput";
import ProtectedRoute from "./components/ProtectedRoute";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WorkspaceProvider>
            <AppContextProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <WorkspaceChecker>
                        <Index />
                      </WorkspaceChecker>
                    </ProtectedRoute>
                  } />
                  <Route path="/workspaces" element={
                    <ProtectedRoute>
                      <Workspaces />
                    </ProtectedRoute>
                  } />
                  <Route path="/product-input" element={<ProductInput />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </AppContextProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// WorkspaceChecker component to ensure a workspace is selected
const WorkspaceChecker = ({ children }: { children: React.ReactNode }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [hasWorkspace, setHasWorkspace] = useState(false);
  
  useEffect(() => {
    // Check if there's a current workspace in localStorage or if we need to redirect
    const workspaceId = localStorage.getItem('currentWorkspaceId');
    if (workspaceId) {
      setHasWorkspace(true);
    } else {
      // No workspace selected, we'll handle this in render phase
      setHasWorkspace(false);
    }
    setIsChecking(false);
  }, []);
  
  if (isChecking) {
    // Show loading state while checking
    return <div className="h-screen w-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (!hasWorkspace) {
    // No workspace selected, redirect to workspace selection page
    return <Navigate to="/workspaces" replace />;
  }
  
  // Workspace is selected, render children
  return <>{children}</>;
};

export default App;
