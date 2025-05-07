
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import CookieConsent from "./components/CookieConsent";
import AppRoutes from "./routes/AppRoutes";
import { useEffect, useState } from "react";
import { encryptionService } from "./services/encryptionService";
import { databaseEncryptionService } from "./services/databaseEncryptionService";
import { supabase } from "./integrations/supabase/client";
import LandingPage from "./pages/Landing";
import { toast } from "./components/ui/use-toast";
import { initializeAppEnvironment } from "./utils/appSetup";

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Initialize function for encryption services
const initEncryptionServices = async () => {
  try {
    await Promise.all([
      encryptionService.initialize(),
      databaseEncryptionService.initialize()
    ]);
    console.log("Encryption services initialized");
  } catch (error) {
    console.error("Failed to initialize encryption services:", error);
  }
};

// Call initialization immediately to ensure encryption services
// are ready as soon as possible
initEncryptionServices();

// External landing page URL
const LANDING_PAGE_URL = "https://flaresync.org";

const App = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  
  // Ensure encryption services and app environment are initialized when the app component mounts
  useEffect(() => {
    const initApp = async () => {
      try {
        await initEncryptionServices();
        await initializeAppEnvironment();
      } catch (error) {
        console.error("App initialization error:", error);
      }
    };
    
    initApp();
  }, []);

  // Check if the user is coming from the external landing page
  useEffect(() => {
    const checkAuthRedirect = async () => {
      // Check for authentication token in URL parameters (coming from external site)
      const urlParams = new URLSearchParams(window.location.search);
      const externalToken = urlParams.get('auth_token');
      
      if (externalToken) {
        try {
          // If we have a token from the external site, let's use it to sign in
          // This would be a special method to verify the token from external site
          const { data, error } = await supabase.auth.signInWithPassword({
            email: urlParams.get('email') || '',
            password: externalToken
          });
          
          if (error) throw error;
          
          // Clear the URL parameters after successful login
          window.history.replaceState({}, document.title, window.location.pathname);
          
          toast({
            title: "Signed in successfully",
            description: "Welcome back to FlareSync!",
          });
        } catch (error) {
          console.error("External auth error:", error);
          toast({
            variant: "destructive",
            title: "Authentication failed",
            description: "There was an error authenticating with the external service."
          });
          
          // Redirect to landing page on auth failure
          window.location.href = LANDING_PAGE_URL;
        } finally {
          setIsAuthenticating(false);
        }
      } else {
        setIsAuthenticating(false);
      }
    };
    
    checkAuthRedirect();
  }, []);

  if (isAuthenticating) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider externalLandingPageUrl={LANDING_PAGE_URL}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
            <CookieConsent />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
