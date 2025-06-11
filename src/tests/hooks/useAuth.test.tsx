
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide authentication context', async () => {
    const mockSession = {
      user: { 
        id: '123', 
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2023-01-01T00:00:00.000Z',
        email_confirmed_at: '2023-01-01T00:00:00.000Z',
        last_sign_in_at: '2023-01-01T00:00:00.000Z',
        role: 'authenticated',
        updated_at: '2023-01-01T00:00:00.000Z'
      },
      access_token: 'token',
      refresh_token: 'refresh_token',
      expires_in: 3600,
      token_type: 'bearer' as const,
      expires_at: Date.now() / 1000 + 3600
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current).toBeDefined();
    expect(typeof result.current.signIn).toBe('function');
    expect(typeof result.current.signOut).toBe('function');
  });
});
