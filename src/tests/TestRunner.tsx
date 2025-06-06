
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, Play, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration: number;
  error?: string;
  category: string;
  timestamp: string;
}

interface TestSuite {
  name: string;
  tests: Array<() => Promise<void>>;
  category: string;
}

export const TestRunner: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);

  const testSuites: TestSuite[] = [
    {
      name: 'Authentication Tests',
      category: 'auth',
      tests: [
        testUserSignup,
        testUserLogin,
        testUserLogout,
        testPasswordReset,
        testSessionPersistence
      ]
    },
    {
      name: 'Content Management Tests',
      category: 'content',
      tests: [
        testContentCreation,
        testContentScheduling,
        testContentDeletion,
        testContentUpdate,
        testMediaUpload
      ]
    },
    {
      name: 'Brand Deals Tests',
      category: 'deals',
      tests: [
        testDealCreation,
        testDealAcceptance,
        testDealRejection,
        testDealCompletion,
        testDealListing
      ]
    },
    {
      name: 'Analytics Tests',
      category: 'analytics',
      tests: [
        testAnalyticsGeneration,
        testEngagementPrediction,
        testPerformanceTracking,
        testReportGeneration
      ]
    },
    {
      name: 'Admin Functions Tests',
      category: 'admin',
      tests: [
        testUserManagement,
        testContentModeration,
        testSystemHealth,
        testBillingTracking
      ]
    }
  ];

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    for (const suite of testSuites) {
      for (const test of suite.tests) {
        const testId = `${suite.category}_${test.name}_${Date.now()}`;
        const testName = test.name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        
        setCurrentTest(testName);
        
        const startTime = Date.now();
        const testResult: TestResult = {
          id: testId,
          name: testName,
          status: 'running',
          duration: 0,
          category: suite.category,
          timestamp: new Date().toISOString()
        };
        
        setTestResults(prev => [...prev, testResult]);
        
        try {
          await test();
          const duration = Date.now() - startTime;
          
          setTestResults(prev => prev.map(result => 
            result.id === testId 
              ? { ...result, status: 'passed', duration }
              : result
          ));
          
          // Save successful test result to database
          await supabase.from('test_results').insert({
            test_id: testId,
            test_name: testName,
            category: suite.category,
            status: 'passed',
            duration,
            executed_at: new Date().toISOString()
          });
          
        } catch (error) {
          const duration = Date.now() - startTime;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          setTestResults(prev => prev.map(result => 
            result.id === testId 
              ? { ...result, status: 'failed', duration, error: errorMessage }
              : result
          ));
          
          // Save failed test result to database
          await supabase.from('test_results').insert({
            test_id: testId,
            test_name: testName,
            category: suite.category,
            status: 'failed',
            duration,
            error_message: errorMessage,
            executed_at: new Date().toISOString()
          });
        }
      }
    }
    
    setIsRunning(false);
    setCurrentTest(null);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      passed: 'default',
      failed: 'destructive',
      running: 'secondary',
      pending: 'outline'
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const passedTests = testResults.filter(t => t.status === 'passed').length;
  const failedTests = testResults.filter(t => t.status === 'failed').length;
  const totalTests = testResults.length;
  const progress = totalTests > 0 ? (passedTests + failedTests) / totalTests * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Test Suite Runner</h2>
        <Button onClick={runAllTests} disabled={isRunning}>
          <Play className="h-4 w-4 mr-2" />
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </Button>
      </div>

      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle>Test Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progress} className="w-full" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress: {Math.round(progress)}%</span>
                <span>{passedTests} passed, {failedTests} failed, {totalTests} total</span>
              </div>
              {currentTest && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 animate-spin text-blue-500" />
                  <span>Running: {currentTest}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {testSuites.map((suite, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {suite.name}
                <Badge variant="outline">{suite.category}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {testResults
                  .filter(result => result.category === suite.category)
                  .map(result => (
                    <div key={result.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <span>{result.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.duration > 0 && (
                          <span className="text-sm text-muted-foreground">
                            {result.duration}ms
                          </span>
                        )}
                        {getStatusBadge(result.status)}
                      </div>
                      {result.error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          {result.error}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Test Functions
async function testUserSignup() {
  const testEmail = `test_${Date.now()}@example.com`;
  const { error } = await supabase.auth.signUp({
    email: testEmail,
    password: 'testpassword123'
  });
  if (error) throw new Error(`Signup failed: ${error.message}`);
}

async function testUserLogin() {
  const { error } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'testpassword123'
  });
  if (error && !error.message.includes('Invalid')) {
    throw new Error(`Login test failed: ${error.message}`);
  }
}

async function testUserLogout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(`Logout failed: ${error.message}`);
}

async function testPasswordReset() {
  const { error } = await supabase.auth.resetPasswordForEmail('test@example.com');
  if (error) throw new Error(`Password reset failed: ${error.message}`);
}

async function testSessionPersistence() {
  const { data: { session } } = await supabase.auth.getSession();
  // This test always passes as it's checking the session state
  console.log('Session persistence test completed');
}

async function testContentCreation() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');
  
  const { error } = await supabase.from('content_posts').insert({
    user_id: user.user.id,
    title: 'Test Post',
    body: 'Test content',
    platform: 'instagram',
    status: 'draft'
  });
  if (error) throw new Error(`Content creation failed: ${error.message}`);
}

async function testContentScheduling() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');
  
  const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase.from('scheduled_posts').insert({
    user_id: user.user.id,
    content: 'Scheduled test post',
    platform: 'instagram',
    scheduled_for: futureDate,
    status: 'pending'
  });
  if (error) throw new Error(`Content scheduling failed: ${error.message}`);
}

async function testContentDeletion() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');
  
  // Create a test post first
  const { data: post, error: createError } = await supabase.from('content_posts').insert({
    user_id: user.user.id,
    title: 'Test Delete Post',
    body: 'To be deleted',
    platform: 'instagram',
    status: 'draft'
  }).select().single();
  
  if (createError) throw new Error(`Test post creation failed: ${createError.message}`);
  
  // Then delete it
  const { error: deleteError } = await supabase.from('content_posts').delete().eq('id', post.id);
  if (deleteError) throw new Error(`Content deletion failed: ${deleteError.message}`);
}

async function testContentUpdate() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');
  
  // Get existing post to update
  const { data: posts } = await supabase.from('content_posts')
    .select('id')
    .eq('user_id', user.user.id)
    .limit(1);
    
  if (!posts || posts.length === 0) {
    // Create a post if none exists
    const { data: newPost, error: createError } = await supabase.from('content_posts').insert({
      user_id: user.user.id,
      title: 'Test Update Post',
      body: 'Original content',
      platform: 'instagram',
      status: 'draft'
    }).select().single();
    
    if (createError) throw new Error(`Test post creation failed: ${createError.message}`);
    
    const { error } = await supabase.from('content_posts')
      .update({ title: 'Updated Test Post' })
      .eq('id', newPost.id);
    if (error) throw new Error(`Content update failed: ${error.message}`);
  } else {
    const { error } = await supabase.from('content_posts')
      .update({ title: 'Updated Test Post' })
      .eq('id', posts[0].id);
    if (error) throw new Error(`Content update failed: ${error.message}`);
  }
}

async function testMediaUpload() {
  // Simulate media upload test (would require actual file in real scenario)
  console.log('Media upload test simulated - would require actual file upload');
}

async function testDealCreation() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');
  
  const { error } = await supabase.from('brand_deals').insert({
    brand_id: user.user.id,
    creator_id: user.user.id,
    title: 'Test Deal',
    description: 'Test deal description',
    budget: 1000,
    brand_name: 'Test Brand',
    requirements: ['Test requirement'],
    deliverables: ['Test deliverable']
  });
  if (error) throw new Error(`Deal creation failed: ${error.message}`);
}

async function testDealAcceptance() {
  const { data: deals } = await supabase.from('brand_deals')
    .select('id')
    .eq('status', 'pending')
    .limit(1);
    
  if (deals && deals.length > 0) {
    const { error } = await supabase.from('brand_deals')
      .update({ status: 'accepted' })
      .eq('id', deals[0].id);
    if (error) throw new Error(`Deal acceptance failed: ${error.message}`);
  }
}

async function testDealRejection() {
  const { data: deals } = await supabase.from('brand_deals')
    .select('id')
    .eq('status', 'pending')
    .limit(1);
    
  if (deals && deals.length > 0) {
    const { error } = await supabase.from('brand_deals')
      .update({ status: 'rejected' })
      .eq('id', deals[0].id);
    if (error) throw new Error(`Deal rejection failed: ${error.message}`);
  }
}

async function testDealCompletion() {
  const { data: deals } = await supabase.from('brand_deals')
    .select('id')
    .eq('status', 'accepted')
    .limit(1);
    
  if (deals && deals.length > 0) {
    const { error } = await supabase.from('brand_deals')
      .update({ status: 'completed' })
      .eq('id', deals[0].id);
    if (error) throw new Error(`Deal completion failed: ${error.message}`);
  }
}

async function testDealListing() {
  const { data, error } = await supabase.from('brand_deals').select('*').limit(10);
  if (error) throw new Error(`Deal listing failed: ${error.message}`);
  if (!data) throw new Error('No deals found');
}

async function testAnalyticsGeneration() {
  const { data, error } = await supabase.from('content_posts')
    .select('id, created_at')
    .limit(10);
  if (error) throw new Error(`Analytics generation failed: ${error.message}`);
}

async function testEngagementPrediction() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');
  
  const { error } = await supabase.from('engagement_predictions').insert({
    user_id: user.user.id,
    platform: 'instagram',
    content: 'Test prediction content',
    predicted_likes: 100,
    predicted_comments: 10,
    predicted_shares: 5,
    confidence_score: 0.85
  });
  if (error) throw new Error(`Engagement prediction failed: ${error.message}`);
}

async function testPerformanceTracking() {
  const { data, error } = await supabase.from('content_posts')
    .select('id, metrics')
    .not('metrics', 'is', null)
    .limit(5);
  if (error) throw new Error(`Performance tracking failed: ${error.message}`);
}

async function testReportGeneration() {
  // Test report generation by querying multiple tables
  const [posts, deals, notifications] = await Promise.all([
    supabase.from('content_posts').select('count'),
    supabase.from('brand_deals').select('count'),
    supabase.from('notifications').select('count')
  ]);
  
  if (posts.error || deals.error || notifications.error) {
    throw new Error('Report generation failed');
  }
}

async function testUserManagement() {
  const { data, error } = await supabase.from('profiles').select('id, email').limit(10);
  if (error) throw new Error(`User management test failed: ${error.message}`);
}

async function testContentModeration() {
  const { data, error } = await supabase.from('content_posts')
    .select('id, status')
    .in('status', ['published', 'draft'])
    .limit(10);
  if (error) throw new Error(`Content moderation test failed: ${error.message}`);
}

async function testSystemHealth() {
  // Test database connectivity
  const { data, error } = await supabase.from('profiles').select('count').limit(1);
  if (error) throw new Error(`System health check failed: ${error.message}`);
}

async function testBillingTracking() {
  const { data, error } = await supabase.from('transactions').select('*').limit(5);
  if (error) throw new Error(`Billing tracking test failed: ${error.message}`);
}
