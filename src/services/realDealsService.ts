
import { supabase } from '@/integrations/supabase/client';

export interface BrandDeal {
  id: string;
  brand_id: string;
  creator_id: string;
  title: string;
  description: string;
  budget: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  requirements: string[];
  deliverables: string[];
  deadline?: string;
  brand_name: string;
  brand_logo?: string;
  created_at: string;
  updated_at: string;
}

export class RealDealsService {
  static async getDealsForUser(userId: string, userType: 'creator' | 'brand'): Promise<BrandDeal[]> {
    let query = supabase
      .from('brand_deals')
      .select(`
        *,
        brand_profile:profiles!brand_deals_brand_id_fkey(full_name, avatar_url),
        creator_profile:profiles!brand_deals_creator_id_fkey(full_name, avatar_url)
      `);

    if (userType === 'creator') {
      query = query.eq('creator_id', userId);
    } else {
      query = query.eq('brand_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deals:', error);
      return [];
    }

    return (data || []).map(deal => ({
      ...deal,
      brand_name: deal.brand_profile?.full_name || 'Unknown Brand',
      brand_logo: deal.brand_profile?.avatar_url || ''
    }));
  }

  static async createDeal(dealData: {
    creator_id: string;
    title: string;
    description: string;
    budget: number;
    requirements: string[];
    deliverables: string[];
    deadline?: string;
  }): Promise<BrandDeal | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('brand_deals')
      .insert({
        ...dealData,
        brand_id: user.id,
        status: 'pending'
      })
      .select(`
        *,
        brand_profile:profiles!brand_deals_brand_id_fkey(full_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error creating deal:', error);
      return null;
    }

    return {
      ...data,
      brand_name: data.brand_profile?.full_name || 'Unknown Brand',
      brand_logo: data.brand_profile?.avatar_url || ''
    };
  }

  static async updateDealStatus(
    dealId: string, 
    status: 'accepted' | 'rejected' | 'completed'
  ): Promise<BrandDeal | null> {
    const { data, error } = await supabase
      .from('brand_deals')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', dealId)
      .select(`
        *,
        brand_profile:profiles!brand_deals_brand_id_fkey(full_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error updating deal status:', error);
      return null;
    }

    return {
      ...data,
      brand_name: data.brand_profile?.full_name || 'Unknown Brand',
      brand_logo: data.brand_profile?.avatar_url || ''
    };
  }

  static async getDeal(dealId: string): Promise<BrandDeal | null> {
    const { data, error } = await supabase
      .from('brand_deals')
      .select(`
        *,
        brand_profile:profiles!brand_deals_brand_id_fkey(full_name, avatar_url),
        creator_profile:profiles!brand_deals_creator_id_fkey(full_name, avatar_url)
      `)
      .eq('id', dealId)
      .single();

    if (error) {
      console.error('Error fetching deal:', error);
      return null;
    }

    return {
      ...data,
      brand_name: data.brand_profile?.full_name || 'Unknown Brand',
      brand_logo: data.brand_profile?.avatar_url || ''
    };
  }
}
