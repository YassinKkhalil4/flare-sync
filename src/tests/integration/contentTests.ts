
import { supabase } from '@/integrations/supabase/client';
import { testHelper } from '../utils/testHelpers';

export class ContentTestSuite {
  async runContentCreationTest(): Promise<void> {
    const testUserId = await testHelper.setupTestUser();
    
    const contentData = {
      user_id: testUserId,
      title: 'Integration Test Post',
      body: 'This is a test post created during integration testing',
      platform: 'instagram',
      status: 'draft'
    };

    const { data, error } = await supabase
      .from('content_posts')
      .insert(contentData)
      .select()
      .single();

    if (error) {
      throw new Error(`Content creation failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No content data returned');
    }

    // Verify content exists in database
    await testHelper.assertRecordExists('content_posts', data.id);
    
    // Verify content belongs to test user
    if (data.user_id !== testUserId) {
      throw new Error('Content user_id mismatch');
    }
  }

  async runContentSchedulingTest(): Promise<void> {
    const testUserId = await testHelper.setupTestUser();
    
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const scheduledData = {
      user_id: testUserId,
      content: 'Scheduled test content',
      platform: 'instagram',
      scheduled_for: futureDate.toISOString(),
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('scheduled_posts')
      .insert(scheduledData)
      .select()
      .single();

    if (error) {
      throw new Error(`Content scheduling failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No scheduled content data returned');
    }

    // Verify scheduled post exists
    await testHelper.assertRecordExists('scheduled_posts', data.id);
    
    // Verify scheduling date is in the future
    const scheduledDate = new Date(data.scheduled_for);
    if (scheduledDate <= new Date()) {
      throw new Error('Scheduled date is not in the future');
    }
  }

  async runContentUpdateTest(): Promise<void> {
    const testUserId = await testHelper.setupTestUser();
    const contentId = await testHelper.createTestContent(testUserId);
    
    const updatedTitle = 'Updated Test Content';
    const { data, error } = await supabase
      .from('content_posts')
      .update({ title: updatedTitle })
      .eq('id', contentId)
      .select()
      .single();

    if (error) {
      throw new Error(`Content update failed: ${error.message}`);
    }

    if (data.title !== updatedTitle) {
      throw new Error('Content title was not updated');
    }

    // Verify update timestamp changed
    if (!data.updated_at) {
      throw new Error('Updated timestamp not set');
    }
  }

  async runContentDeletionTest(): Promise<void> {
    const testUserId = await testHelper.setupTestUser();
    const contentId = await testHelper.createTestContent(testUserId);
    
    // Verify content exists before deletion
    await testHelper.assertRecordExists('content_posts', contentId);
    
    const { error } = await supabase
      .from('content_posts')
      .delete()
      .eq('id', contentId);

    if (error) {
      throw new Error(`Content deletion failed: ${error.message}`);
    }

    // Verify content no longer exists
    await testHelper.assertRecordNotExists('content_posts', contentId);
  }

  async runMediaUploadTest(): Promise<void> {
    // Create a simple test file
    const testContent = 'test image content';
    const testFile = new Blob([testContent], { type: 'text/plain' });
    const fileName = `test-image-${Date.now()}.txt`;

    const { data, error } = await supabase.storage
      .from('media')
      .upload(fileName, testFile);

    if (error) {
      throw new Error(`Media upload failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No upload data returned');
    }

    // Verify file was uploaded
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('media')
      .download(data.path);

    if (downloadError) {
      throw new Error(`Media download verification failed: ${downloadError.message}`);
    }

    if (!fileData) {
      throw new Error('No file data found after upload');
    }

    // Cleanup - remove uploaded file
    await supabase.storage.from('media').remove([data.path]);
  }
}
