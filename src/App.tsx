
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

// Initialize both encryption services at app start
const initEncryption = async () => {
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

// Call initialization function
initEncryption();

const App = () => (
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

export default App;
