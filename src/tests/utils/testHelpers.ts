
import { supabase } from '@/integrations/supabase/client';

export interface TestContext {
  testUserId?: string;
  testData: Record<string, any>;
  cleanup: Array<() => Promise<void>>;
}

export class TestHelper {
  private static instance: TestHelper;
  private context: TestContext = {
    testData: {},
    cleanup: []
  };

  static getInstance(): TestHelper {
    if (!TestHelper.instance) {
      TestHelper.instance = new TestHelper();
    }
    return TestHelper.instance;
  }

  async setupTestUser(): Promise<string> {
    const testEmail = `test_user_${Date.now()}@flare-sync-test.com`;
    const testPassword = 'TestPassword123!';
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (error) throw new Error(`Failed to create test user: ${error.message}`);
    if (!data.user) throw new Error('No user data returned');

    this.context.testUserId = data.user.id;
    
    // Add cleanup for test user
    this.context.cleanup.push(async () => {
      if (this.context.testUserId) {
        await supabase.auth.admin.deleteUser(this.context.testUserId);
      }
    });

    return data.user.id;
  }

  async createTestContent(userId: string, data: Partial<any> = {}): Promise<string> {
    const contentData = {
      user_id: userId,
      title: 'Test Content',
      body: 'Test content body',
      platform: 'instagram',
      status: 'draft',
      ...data
    };

    const { data: content, error } = await supabase
      .from('content_posts')
      .insert(contentData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create test content: ${error.message}`);

    // Add cleanup for test content
    this.context.cleanup.push(async () => {
      await supabase.from('content_posts').delete().eq('id', content.id);
    });

    return content.id;
  }

  async createTestDeal(brandId: string, creatorId: string, data: Partial<any> = {}): Promise<string> {
    const dealData = {
      brand_id: brandId,
      creator_id: creatorId,
      title: 'Test Deal',
      description: 'Test deal description',
      budget: 1000,
      brand_name: 'Test Brand',
      status: 'pending',
      requirements: ['Test requirement'],
      deliverables: ['Test deliverable'],
      ...data
    };

    const { data: deal, error } = await supabase
      .from('brand_deals')
      .insert(dealData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create test deal: ${error.message}`);

    // Add cleanup for test deal
    this.context.cleanup.push(async () => {
      await supabase.from('brand_deals').delete().eq('id', deal.id);
    });

    return deal.id;
  }

  async createTestNotification(userId: string, data: Partial<any> = {}): Promise<string> {
    const notificationData = {
      user_id: userId,
      title: 'Test Notification',
      message: 'Test notification message',
      type: 'announcement',
      is_read: false,
      ...data
    };

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create test notification: ${error.message}`);

    // Add cleanup for test notification
    this.context.cleanup.push(async () => {
      await supabase.from('notifications').delete().eq('id', notification.id);
    });

    return notification.id;
  }

  async createTestTransaction(userId: string, data: Partial<any> = {}): Promise<string> {
    const transactionData = {
      user_id: userId,
      amount: 29.99,
      currency: 'usd',
      status: 'completed',
      description: 'Test transaction',
      payment_method: 'card',
      ...data
    };

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create test transaction: ${error.message}`);

    // Add cleanup for test transaction
    this.context.cleanup.push(async () => {
      await supabase.from('transactions').delete().eq('id', transaction.id);
    });

    return transaction.id;
  }

  async cleanup(): Promise<void> {
    // Run all cleanup functions in reverse order
    for (let i = this.context.cleanup.length - 1; i >= 0; i--) {
      try {
        await this.context.cleanup[i]();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }
    
    // Reset context
    this.context = {
      testData: {},
      cleanup: []
    };
  }

  setTestData(key: string, value: any): void {
    this.context.testData[key] = value;
  }

  getTestData(key: string): any {
    return this.context.testData[key];
  }

  async waitForCondition(
    condition: () => Promise<boolean>,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  async assertDatabaseState(table: string, condition: Record<string, any>): Promise<void> {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .match(condition);

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error(`No records found in ${table} matching condition: ${JSON.stringify(condition)}`);
    }
  }

  async assertRecordExists(table: string, id: string): Promise<void> {
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new Error(`Record with id ${id} not found in table ${table}`);
    }
  }

  async assertRecordNotExists(table: string, id: string): Promise<void> {
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .eq('id', id)
      .single();

    if (data) {
      throw new Error(`Record with id ${id} still exists in table ${table}`);
    }
  }
}

export const testHelper = TestHelper.getInstance();
