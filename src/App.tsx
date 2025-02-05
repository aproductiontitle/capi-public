import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import Index from "@/pages/Index";
import Assistants from "@/pages/Assistants";
import Settings from "@/pages/Settings";
import Teams from "@/pages/Teams";
import Campaigns from "@/pages/Campaigns";
import CampaignAnalytics from "@/pages/CampaignAnalytics";
import Documentation from "@/pages/Documentation";
import Knowledge from "@/pages/Knowledge";
import Contacts from "@/pages/Contacts";
import Navigation from "@/components/Navigation";
import Auth from "@/pages/Auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const queryClient = new QueryClient();

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Router>
          <div className="min-h-screen bg-background">
            {user && <Navigation />}
            <main className={user ? "container mx-auto px-4 pt-20 pb-8" : ""}>
              <Routes>
                <Route 
                  path="/" 
                  element={user ? <Index /> : <Navigate to="/auth" replace />} 
                />
                <Route 
                  path="/assistants" 
                  element={user ? <Assistants /> : <Navigate to="/auth" replace />} 
                />
                <Route 
                  path="/settings" 
                  element={user ? <Settings /> : <Navigate to="/auth" replace />} 
                />
                <Route 
                  path="/teams" 
                  element={user ? <Teams /> : <Navigate to="/auth" replace />} 
                />
                <Route 
                  path="/campaigns" 
                  element={user ? <Campaigns /> : <Navigate to="/auth" replace />} 
                />
                <Route 
                  path="/campaigns/:id" 
                  element={user ? <CampaignAnalytics /> : <Navigate to="/auth" replace />} 
                />
                <Route 
                  path="/contacts" 
                  element={user ? <Contacts /> : <Navigate to="/auth" replace />} 
                />
                <Route 
                  path="/documentation" 
                  element={user ? <Documentation /> : <Navigate to="/auth" replace />} 
                />
                <Route 
                  path="/knowledge" 
                  element={user ? <Knowledge /> : <Navigate to="/auth" replace />} 
                />
                <Route 
                  path="/auth" 
                  element={!user ? <Auth /> : <Navigate to="/" replace />} 
                />
              </Routes>
            </main>
          </div>
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;