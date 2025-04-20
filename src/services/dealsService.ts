
import { supabase } from '@/integrations/supabase/client';

export interface Deal {
  id: string;
  creator_id: string;
  brand_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  price: number;
  description: string;
  created_at: string;
}

class DealsService {
  async getDeals() {
    const { data: deals, error } = await supabase
      .from('deals')
      .select('*, profiles!deals_creator_id_fkey(*), profiles!deals_brand_id_fkey(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return deals;
  }

  async createDeal(deal: Omit<Deal, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('deals')
      .insert([deal])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDealStatus(dealId: string, status: 'accepted' | 'rejected') {
    const { data, error } = await supabase
      .from('deals')
      .update({ status })
      .eq('id', dealId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const dealsService = new DealsService();
