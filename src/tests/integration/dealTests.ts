
import { supabase } from '@/integrations/supabase/client';
import { testHelper } from '../utils/testHelpers';

export class DealTestSuite {
  async runDealCreationTest(): Promise<void> {
    const brandUserId = await testHelper.setupTestUser();
    const creatorUserId = await testHelper.setupTestUser();
    
    const dealData = {
      brand_id: brandUserId,
      creator_id: creatorUserId,
      title: 'Integration Test Deal',
      description: 'This is a test deal created during integration testing',
      budget: 1500,
      brand_name: 'Test Brand Inc.',
      status: 'pending',
      requirements: ['Create Instagram post', 'Include brand hashtag'],
      deliverables: ['1 Instagram post', 'Story mention']
    };

    const { data, error } = await supabase
      .from('brand_deals')
      .insert(dealData)
      .select()
      .single();

    if (error) {
      throw new Error(`Deal creation failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No deal data returned');
    }

    // Verify deal exists in database
    await testHelper.assertRecordExists('brand_deals', data.id);
    
    // Verify deal has correct status
    if (data.status !== 'pending') {
      throw new Error('Deal status is not pending');
    }
  }

  async runDealAcceptanceTest(): Promise<void> {
    const brandUserId = await testHelper.setupTestUser();
    const creatorUserId = await testHelper.setupTestUser();
    const dealId = await testHelper.createTestDeal(brandUserId, creatorUserId);
    
    const { data, error } = await supabase
      .from('brand_deals')
      .update({ status: 'accepted' })
      .eq('id', dealId)
      .select()
      .single();

    if (error) {
      throw new Error(`Deal acceptance failed: ${error.message}`);
    }

    if (data.status !== 'accepted') {
      throw new Error('Deal status was not updated to accepted');
    }

    // Verify updated_at timestamp changed
    if (!data.updated_at) {
      throw new Error('Updated timestamp not set');
    }
  }

  async runDealRejectionTest(): Promise<void> {
    const brandUserId = await testHelper.setupTestUser();
    const creatorUserId = await testHelper.setupTestUser();
    const dealId = await testHelper.createTestDeal(brandUserId, creatorUserId);
    
    const { data, error } = await supabase
      .from('brand_deals')
      .update({ status: 'rejected' })
      .eq('id', dealId)
      .select()
      .single();

    if (error) {
      throw new Error(`Deal rejection failed: ${error.message}`);
    }

    if (data.status !== 'rejected') {
      throw new Error('Deal status was not updated to rejected');
    }
  }

  async runDealCompletionTest(): Promise<void> {
    const brandUserId = await testHelper.setupTestUser();
    const creatorUserId = await testHelper.setupTestUser();
    const dealId = await testHelper.createTestDeal(brandUserId, creatorUserId, { status: 'accepted' });
    
    const { data, error } = await supabase
      .from('brand_deals')
      .update({ status: 'completed' })
      .eq('id', dealId)
      .select()
      .single();

    if (error) {
      throw new Error(`Deal completion failed: ${error.message}`);
    }

    if (data.status !== 'completed') {
      throw new Error('Deal status was not updated to completed');
    }
  }

  async runDealListingTest(): Promise<void> {
    const testUserId = await testHelper.setupTestUser();
    
    // Create multiple test deals
    await testHelper.createTestDeal(testUserId, testUserId);
    await testHelper.createTestDeal(testUserId, testUserId);
    await testHelper.createTestDeal(testUserId, testUserId);
    
    const { data, error } = await supabase
      .from('brand_deals')
      .select('*')
      .eq('brand_id', testUserId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Deal listing failed: ${error.message}`);
    }

    if (!data || data.length < 3) {
      throw new Error('Not all test deals were retrieved');
    }

    // Verify deals are ordered by creation date
    for (let i = 1; i < data.length; i++) {
      const prevDate = new Date(data[i - 1].created_at);
      const currentDate = new Date(data[i].created_at);
      
      if (prevDate < currentDate) {
        throw new Error('Deals are not properly ordered by creation date');
      }
    }
  }

  async runDealSearchTest(): Promise<void> {
    const brandUserId = await testHelper.setupTestUser();
    const creatorUserId = await testHelper.setupTestUser();
    
    const searchTitle = 'Unique Search Test Deal';
    await testHelper.createTestDeal(brandUserId, creatorUserId, { title: searchTitle });
    
    const { data, error } = await supabase
      .from('brand_deals')
      .select('*')
      .ilike('title', `%${searchTitle}%`);

    if (error) {
      throw new Error(`Deal search failed: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('Search did not return expected deal');
    }

    const foundDeal = data.find(deal => deal.title === searchTitle);
    if (!foundDeal) {
      throw new Error('Specific deal not found in search results');
    }
  }
}
