import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Employee from "./pages/Employee";
import Employees from "./pages/Employees";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";

const queryClient = new QueryClient();

type AuthContextType = {
  user: User | null;
  loading: boolean;
  userRole: 'admin' | 'employee' | null;
};

export const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  userRole: null
});

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: ('admin' | 'employee')[]; }) => {
  const { user, loading, userRole } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'employee' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          getUserRole(session.user.id);
        } else {
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      setLoading(false);
      return;
    }

    setUserRole(data.role);
    setLoading(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, loading, userRole }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <SidebarProvider>
                      <div className="min-h-screen flex w-full">
                        <AppSidebar />
                        <main className="flex-1 bg-white p-6">
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route 
                              path="/admin" 
                              element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                  <Admin />
                                </ProtectedRoute>
                              } 
                            />
                            <Route 
                              path="/employee" 
                              element={
                                <ProtectedRoute allowedRoles={['employee']}>
                                  <Employee />
                                </ProtectedRoute>
                              } 
                            />
                            <Route 
                              path="/employees" 
                              element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                  <Employees />
                                </ProtectedRoute>
                              } 
                            />
                            <Route path="/profile" element={<Profile />} />
                            <Route 
                              path="/projects" 
                              element={
                                <ProtectedRoute>
                                  <Projects />
                                </ProtectedRoute>
                              } 
                            />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </main>
                      </div>
                    </SidebarProvider>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
