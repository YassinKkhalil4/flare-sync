
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

// Initialize encryption as early as possible
const initEncryption = async () => {
  try {
    await encryptionService.initialize();
    console.log("Encryption initialized");
  } catch (error) {
    console.error("Failed to initialize encryption:", error);
  }
};

// Initialize encryption
initEncryption();

const queryClient = new QueryClient();

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
