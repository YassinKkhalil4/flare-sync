
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface ApiKeyData {
  id: string;
  user_id: string;
  key_name: string;
  key_value: string;
  created_at: string;
  updated_at: string;
}

export class ApiKeyService {
  static async storeApiKeys(apiKeys: Record<string, string>): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return { success: false, error: 'Authentication required' };
      }

      const { data, error } = await supabase.functions.invoke('store-api-keys', {
        body: { apiKeys },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getUserApiKeys(): Promise<{ data: ApiKeyData[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data || [] };
    } catch (error) {
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async deleteApiKey(keyId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_api_keys')
        .delete()
        .eq('id', keyId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async testApiKey(keyName: string, keyValue: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('test-api-key', {
        body: { keyName, keyValue },
      });

      if (error) {
        return { valid: false, error: error.message };
      }

      return { valid: data.valid };
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
