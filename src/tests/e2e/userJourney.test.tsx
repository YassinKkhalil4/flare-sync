
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import App from '@/App';

const renderApp = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('User Journey E2E Tests', () => {
  beforeEach(() => {
    // Reset any mocks
  });

  it('should render landing page for unauthenticated users', async () => {
    renderApp();
    
    await waitFor(() => {
      expect(screen.getByText(/FlareSync/i)).toBeInTheDocument();
    });
  });

  it('should navigate to login page', async () => {
    renderApp();
    
    const loginButton = await screen.findByText(/sign in/i);
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
  });
});
