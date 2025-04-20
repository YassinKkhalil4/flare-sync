
import { supabase } from '@/integrations/supabase/client';

// Define the Deal interface
export interface BrandDeal {
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

class DealsService {
  // Get deals for a specific user based on their role
  async getDeals(userType: 'creator' | 'brand'): Promise<BrandDeal[]> {
    try {
      // Since the brand_deals table doesn't seem to exist yet,
      // let's return mock data
      const mockDeals: BrandDeal[] = [
        {
          id: '1',
          brand_id: 'brand-1',
          brand_name: 'SportyBrand',
          brand_logo: 'https://via.placeholder.com/150',
          creator_id: 'creator-1',
          title: 'Fitness Product Campaign',
          description: 'Create content showcasing our new fitness products',
          budget: 1500,
          status: 'pending',
          requirements: ['Must post on Instagram', 'Include product link'],
          deliverables: ['1 Post', '2 Stories'],
          deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          brand_id: 'brand-2',
          brand_name: 'FashionCo',
          brand_logo: 'https://via.placeholder.com/150',
          creator_id: 'creator-1',
          title: 'Summer Fashion Line',
          description: 'Promote our summer collection across your channels',
          budget: 2500,
          status: 'accepted',
          requirements: ['Tag @fashionco', 'Multiple outfit showcase'],
          deliverables: ['2 Posts', '3 Stories', '1 Reel'],
          deadline: new Date(Date.now() + 86400000 * 14).toISOString(),
          created_at: new Date(Date.now() - 86400000 * 3).toISOString()
        }
      ];
      
      return mockDeals;
    } catch (error) {
      console.error('Error fetching deals:', error);
      throw error;
    }
  }
  
  // Update deal status
  async updateDealStatus(
    dealId: string, 
    status: 'accepted' | 'rejected' | 'completed'
  ): Promise<BrandDeal> {
    try {
      // Mock update deal
      const mockDeal: BrandDeal = {
        id: dealId,
        brand_id: 'brand-1',
        brand_name: 'SportyBrand',
        brand_logo: 'https://via.placeholder.com/150',
        creator_id: 'creator-1',
        title: 'Fitness Product Campaign',
        description: 'Create content showcasing our new fitness products',
        budget: 1500,
        status: status,
        requirements: ['Must post on Instagram', 'Include product link'],
        deliverables: ['1 Post', '2 Stories'],
        deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
        created_at: new Date().toISOString()
      };
      
      return mockDeal;
    } catch (error) {
      console.error('Error updating deal status:', error);
      throw error;
    }
  }
  
  // Create new deal
  async createDeal(dealData: Omit<BrandDeal, 'id' | 'created_at'>): Promise<BrandDeal> {
    try {
      // Mock create deal
      const newDeal: BrandDeal = {
        ...dealData,
        id: Math.random().toString(36).substring(2, 11),
        created_at: new Date().toISOString()
      };
      
      return newDeal;
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  }
}

export const DealsAPI = new DealsService();
