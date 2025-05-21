
// Mock data for brand deals

import { Deal } from '@/services/dealsService';

// Generate random brand deals
export const generateMockBrandDeals = (count: number = 5): Deal[] => {
  const brands = [
    { name: 'Nike', logo: 'https://api.dicebear.com/6.x/identicon/svg?seed=Nike' },
    { name: 'Adidas', logo: 'https://api.dicebear.com/6.x/identicon/svg?seed=Adidas' },
    { name: 'Puma', logo: 'https://api.dicebear.com/6.x/identicon/svg?seed=Puma' },
    { name: 'Under Armour', logo: 'https://api.dicebear.com/6.x/identicon/svg?seed=UnderArmour' },
    { name: 'Reebok', logo: 'https://api.dicebear.com/6.x/identicon/svg?seed=Reebok' },
    { name: 'Lululemon', logo: 'https://api.dicebear.com/6.x/identicon/svg?seed=Lululemon' },
    { name: 'New Balance', logo: 'https://api.dicebear.com/6.x/identicon/svg?seed=NewBalance' }
  ];
  
  const statuses = ['pending', 'accepted', 'rejected', 'completed'];
  
  const deals: Deal[] = [];
  
  for (let i = 0; i < count; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const price = (Math.floor(Math.random() * 15) + 5) * 100; // $500 - $2000
    
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);
    
    deals.push({
      id: `mock-deal-${i+1}`,
      brand_id: `brand-${i+1}`,
      creator_id: `creator-1`,
      status: status as any,
      price,
      description: `Promotional campaign for ${brand.name}'s new product line. Looking for ${i % 2 === 0 ? 'lifestyle' : 'fitness'} content creators to showcase our products in an authentic way. Campaign includes ${Math.floor(Math.random() * 3) + 1} posts over ${Math.floor(Math.random() * 2) + 1} weeks.`,
      created_at: createdAt.toISOString(),
      profiles: {
        full_name: brand.name,
        avatar_url: brand.logo
      }
    });
  }
  
  // Sort by created_at date (newest first)
  return deals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

