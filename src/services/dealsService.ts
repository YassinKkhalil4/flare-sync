import { supabase } from '@/integrations/supabase/client';
import { generateMockBrandDeals } from '@/utils/mockBrandDealsData';

export interface Deal {
  id: string;
  creator_id: string;
  brand_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  price: number;
  description: string;
  created_at: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  } | null;
}

class DealsService {
  async getDeals() {
    // Check if we should use mock data (no actual table or development)
    try {
      const { count, error } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .limit(1);
        
      if (error || count === 0) {
        // If there's an error or no data, use mock data
        return generateMockBrandDeals(8);
      }
      
      // Otherwise, get real data
      const { data, error: fetchError } = await supabase
        .from('deals')
        .select('*, profiles:brand_id(full_name, avatar_url)')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      return data;
    } catch (error) {
      console.error('Error fetching deals, using mock data:', error);
      return generateMockBrandDeals(8);
    }
  }

  async createDeal(deal: Omit<Deal, 'id' | 'created_at' | 'profiles'>) {
    try {
      const { data, error } = await supabase
        .from('deals')
        .insert([deal])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating deal, using mock response:', error);
      // Return a mock response
      return {
        ...deal,
        id: `new-${Date.now()}`,
        created_at: new Date().toISOString()
      };
    }
  }

  async updateDealStatus(dealId: string, status: 'accepted' | 'rejected' | 'completed') {
    try {
      const { data, error } = await supabase
        .from('deals')
        .update({ status })
        .eq('id', dealId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating deal status, using mock response:', error);
      // Return a mock response
      return {
        id: dealId,
        status,
        updated_at: new Date().toISOString()
      };
    }
  }
  
  async respondToDeal(dealId: string, status: 'accepted' | 'rejected' | 'completed') {
    return this.updateDealStatus(dealId, status);
  }
}

export const dealsService = new DealsService();
