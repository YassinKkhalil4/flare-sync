
import { supabase, isRealSupabaseClient } from '../lib/supabase';

interface BrandDeal {
  id: string;
  brand_id: string;
  brand_name: string;
  brand_logo: string;
  creator_id: string;
  title: string;
  description: string;
  budget: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  requirements: string[];
  deliverables: string[];
  deadline: string;
  created_at: string;
}

// Mock deals for development
const mockDeals = [
  {
    id: '1',
    brand_id: 'brand1',
    brand_name: 'FashionTrends',
    brand_logo: 'https://api.dicebear.com/6.x/initials/svg?seed=FT',
    creator_id: 'creator1',
    title: 'Summer Collection Promotion',
    description: 'Promote our new summer collection with three Instagram posts and one Reel showing our beachwear products.',
    budget: 1500,
    status: 'pending',
    requirements: ['Must tag @fashiontrends', 'Use hashtag #SummerStyle', 'Show at least 3 products'],
    deliverables: ['3 Instagram posts', '1 Instagram Reel (60s minimum)'],
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    brand_id: 'brand2',
    brand_name: 'EcoBeauty',
    brand_logo: 'https://api.dicebear.com/6.x/initials/svg?seed=EB',
    creator_id: 'creator1',
    title: 'Natural Skincare Review',
    description: 'Create an authentic review of our new natural skincare line, highlighting the eco-friendly ingredients and packaging.',
    budget: 800,
    status: 'pending',
    requirements: ['Mention eco-friendly packaging', 'Show before/after results', 'Mention key ingredients'],
    deliverables: ['1 detailed YouTube review (8-10 minutes)', '2 Instagram Stories'],
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  }
];

const useMockDealData = () => {
  let deals = [...mockDeals];
  
  return {
    getDeals: async (userType: 'creator' | 'brand'): Promise<BrandDeal[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return deals;
    },
    
    createDeal: async (deal: Omit<BrandDeal, 'id' | 'created_at'>): Promise<BrandDeal> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newDeal = {
        ...deal,
        id: `deal-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      deals.push(newDeal);
      return newDeal;
    },
    
    updateDealStatus: async (dealId: string, status: 'accepted' | 'rejected' | 'completed'): Promise<BrandDeal> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = deals.findIndex(d => d.id === dealId);
      if (index === -1) throw new Error('Deal not found');
      
      deals[index] = {
        ...deals[index],
        status
      };
      
      return deals[index];
    },
    
    getDeal: async (dealId: string): Promise<BrandDeal> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const deal = deals.find(d => d.id === dealId);
      if (!deal) throw new Error('Deal not found');
      return deal;
    }
  };
};

export const DealsAPI = {
  // Get all deals for the current user
  getDeals: async (userType: 'creator' | 'brand'): Promise<BrandDeal[]> => {
    if (!isRealSupabaseClient()) {
      return useMockDealData().getDeals(userType);
    }
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');
      
      const userId = userData.user.id;
      
      // Query based on user type
      const { data, error } = await supabase
        .from('brand_deals')
        .select('*')
        .eq(userType === 'creator' ? 'creator_id' : 'brand_id', userId);
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching deals:', error);
      return useMockDealData().getDeals(userType);
    }
  },
  
  // Create a new deal (as a brand)
  createDeal: async (deal: Omit<BrandDeal, 'id' | 'created_at'>): Promise<BrandDeal> => {
    if (!isRealSupabaseClient()) {
      return useMockDealData().createDeal(deal);
    }
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');
      
      // Ensure the brand creating the deal is the one logged in
      if (deal.brand_id !== userData.user.id) {
        throw new Error('You can only create deals for your own brand');
      }
      
      const newDeal = {
        ...deal,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('brand_deals')
        .insert(newDeal)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating deal:', error);
      return useMockDealData().createDeal(deal);
    }
  },
  
  // Update deal status (as a creator)
  updateDealStatus: async (dealId: string, status: 'accepted' | 'rejected' | 'completed'): Promise<BrandDeal> => {
    if (!isRealSupabaseClient()) {
      return useMockDealData().updateDealStatus(dealId, status);
    }
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');
      
      // Ensure the creator responding to the deal is the one it's assigned to
      const { data: deal, error: dealError } = await supabase
        .from('brand_deals')
        .select('*')
        .eq('id', dealId)
        .single();
      
      if (dealError) throw dealError;
      
      if (deal.creator_id !== userData.user.id) {
        throw new Error('You can only respond to deals assigned to you');
      }
      
      const { data, error } = await supabase
        .from('brand_deals')
        .update({ status })
        .eq('id', dealId)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error updating deal status:', error);
      return useMockDealData().updateDealStatus(dealId, status);
    }
  },
  
  // Get a specific deal
  getDeal: async (dealId: string): Promise<BrandDeal> => {
    if (!isRealSupabaseClient()) {
      return useMockDealData().getDeal(dealId);
    }
    
    try {
      const { data, error } = await supabase
        .from('brand_deals')
        .select('*')
        .eq('id', dealId)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching deal:', error);
      return useMockDealData().getDeal(dealId);
    }
  }
};
