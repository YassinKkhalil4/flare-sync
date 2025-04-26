
import { supabase } from '@/integrations/supabase/client';

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
    const { data: deals, error } = await supabase
      .from('deals')
      .select('*, profiles:brand_id(full_name, avatar_url)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return deals;
  }

  async createDeal(deal: Omit<Deal, 'id' | 'created_at' | 'profiles'>) {
    const { data, error } = await supabase
      .from('deals')
      .insert([deal])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDealStatus(dealId: string, status: 'accepted' | 'rejected' | 'completed') {
    const { data, error } = await supabase
      .from('deals')
      .update({ status })
      .eq('id', dealId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
  
  async respondToDeal(dealId: string, status: 'accepted' | 'rejected' | 'completed') {
    return this.updateDealStatus(dealId, status);
  }
}

export const dealsService = new DealsService();
