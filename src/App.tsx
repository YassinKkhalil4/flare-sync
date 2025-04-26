
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import CookieConsent from "./components/CookieConsent";
import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";
import { encryptionService } from "./services/encryptionService";
import { databaseEncryptionService } from "./services/databaseEncryptionService";

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

// We'll call initialization immediately to ensure encryption services
// are ready as soon as possible
initEncryptionServices();

const App = () => {
  // Ensure encryption services are initialized when the app component mounts
  useEffect(() => {
    initEncryptionServices();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
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
