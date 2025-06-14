
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    
    expect(await screen.findByText(/FlareSync/i)).toBeInTheDocument();
  });

  it('should navigate to login page', async () => {
    renderApp();
    
    const loginButton = await screen.findByText(/sign in/i);
    if (loginButton) {
      loginButton.click();
      expect(await screen.findByLabelText(/email/i)).toBeInTheDocument();
    }
  });
});
