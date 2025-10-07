import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import Profile from "@/pages/Profile";
import Personnel from "@/pages/Personnel";
import Equipment from "@/pages/Equipment";
import Locations from "@/pages/Locations";
import Props from "@/pages/Props";
import Costumes from "@/pages/Costumes";
import ShootPage from "@/pages/ShootPage";
import PublicShootPage from "@/pages/PublicShootPage";
import MapView from "@/pages/MapView";
import LandingPage from "@/pages/LandingPage";
import NotFound from "@/pages/not-found";

function AppContent() {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const isAuthPage = location === "/auth";

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (isAuthPage || !user) {
    return (
      <Switch>
        <Route path="/auth" component={Auth} />
        <Route path="/auth/callback" component={AuthCallback} />
        <Route path="/public/shoots/:id" component={PublicShootPage} />
        <Route path="/shoots/new">
          <ProtectedRoute>
            <ShootPage />
          </ProtectedRoute>
        </Route>
        <Route path="/shoots/:id">
          <ProtectedRoute>
            <ShootPage />
          </ProtectedRoute>
        </Route>
        <Route path="/shoots">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/calendar">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/map">
          <ProtectedRoute>
            <MapView />
          </ProtectedRoute>
        </Route>
        <Route path="/status/:status">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/profile">
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        </Route>
        <Route path="/personnel">
          <ProtectedRoute>
            <Personnel />
          </ProtectedRoute>
        </Route>
        <Route path="/equipment">
          <ProtectedRoute>
            <Equipment />
          </ProtectedRoute>
        </Route>
        <Route path="/locations">
          <ProtectedRoute>
            <Locations />
          </ProtectedRoute>
        </Route>
        <Route path="/props">
          <ProtectedRoute>
            <Props />
          </ProtectedRoute>
        </Route>
        <Route path="/costumes">
          <ProtectedRoute>
            <Costumes />
          </ProtectedRoute>
        </Route>
        <Route path="/" component={LandingPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                data-testid="button-signout"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto p-6 md:p-8">
              <Switch>
                <Route path="/public/shoots/:id" component={PublicShootPage} />
                <Route path="/">
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </Route>
                <Route path="/shoots">
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </Route>
                <Route path="/calendar">
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </Route>
                <Route path="/map">
                  <ProtectedRoute>
                    <MapView />
                  </ProtectedRoute>
                </Route>
                <Route path="/status/:status">
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </Route>
                <Route path="/profile">
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                </Route>
                <Route path="/personnel">
                  <ProtectedRoute>
                    <Personnel />
                  </ProtectedRoute>
                </Route>
                <Route path="/equipment">
                  <ProtectedRoute>
                    <Equipment />
                  </ProtectedRoute>
                </Route>
                <Route path="/locations">
                  <ProtectedRoute>
                    <Locations />
                  </ProtectedRoute>
                </Route>
                <Route path="/props">
                  <ProtectedRoute>
                    <Props />
                  </ProtectedRoute>
                </Route>
                <Route path="/costumes">
                  <ProtectedRoute>
                    <Costumes />
                  </ProtectedRoute>
                </Route>
                <Route path="/shoots/new">
                  <ProtectedRoute>
                    <ShootPage />
                  </ProtectedRoute>
                </Route>
                <Route path="/shoots/:id">
                  <ProtectedRoute>
                    <ShootPage />
                  </ProtectedRoute>
                </Route>
                <Route path="/auth" component={Auth} />
                <Route path="/auth/callback" component={AuthCallback} />
                <Route component={NotFound} />
              </Switch>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <AppContent />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
