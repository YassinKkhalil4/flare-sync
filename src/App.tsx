
import { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './context/AuthContext';
import CookieConsent from './components/CookieConsent';
import AppRoutes from './routes/AppRoutes';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { initializeAppEnvironment } from './utils/appSetup';
import { Button } from '@/components/ui/button';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import SocialConnectModal from '@/components/social/SocialConnectModal';
import './App.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const initialize = async () => {
    try {
      console.log("Starting app initialization...");
      setIsInitializing(true);
      setInitError(null);
      
      const result = await initializeAppEnvironment();
      
      if (!result.success) {
        setInitError(result.error || 'Failed to initialize application');
        console.error("Initialization failed:", result.error);
      } else {
        console.log("Initialization successful");
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    initialize();
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-bold mb-2">Initializing FlareSync</h2>
          <p className="text-muted-foreground">Please wait while we set up your environment...</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-bold text-red-600 mb-4">Initialization Error</h2>
          <p className="mb-4 text-gray-700">{initError}</p>
          <div className="bg-gray-100 p-4 rounded-md mb-4 text-left text-sm text-gray-600">
            <p className="font-medium mb-2">Troubleshooting steps:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Check your internet connection</li>
              <li>Make sure Supabase services are online</li>
              <li>Verify your API keys and configuration</li>
              <li>Clear your browser cache and try again</li>
            </ol>
          </div>
          <Button
            onClick={handleRetry}
            className="flex items-center justify-center w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Connection
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            If the problem persists, please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <SidebarProvider defaultOpen={true}>
            <div className="flex h-screen w-full bg-background">
              <AppSidebar />
              
              <main className="flex-1 overflow-auto">
                <AppRoutes />
              </main>
              
              {/* Social Connect Modal for new users */}
              <SocialConnectModal />
            </div>
          </SidebarProvider>
          <Toaster />
          <CookieConsent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
