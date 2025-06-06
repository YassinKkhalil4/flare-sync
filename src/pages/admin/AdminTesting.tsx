
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Download, RefreshCw, TestTube, TrendingUp, AlertTriangle, CheckCircle, Play, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface TestResultData {
  id: string;
  test_name: string;
  category: string;
  status: string;
  duration: number;
  error_message?: string;
  executed_at: string;
}

interface TestMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  averageDuration: number;
  successRate: number;
  categoryCoverage: Record<string, number>;
  trendData: Array<{
    date: string;
    passed: number;
    failed: number;
    total: number;
  }>;
}

const AdminTesting = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [testProgress, setTestProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch test results
  const { data: testResults, isLoading, refetch } = useQuery({
    queryKey: ['adminTestResults', selectedTimeRange],
    queryFn: async () => {
      console.log('Fetching test results for range:', selectedTimeRange);
      const startDate = new Date();
      switch (selectedTimeRange) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .gte('executed_at', startDate.toISOString())
        .order('executed_at', { ascending: false });

      if (error) {
        console.error('Error fetching test results:', error);
        throw error;
      }
      
      console.log('Fetched test results:', data);
      return data as TestResultData[];
    }
  });

  // Enhanced test functions with better error handling
  async function runAuthenticationTest() {
    console.log('Running authentication test...');
    
    // Test getting current session
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      throw new Error(`Session check failed: ${sessionError.message}`);
    }
    
    if (!session.session) {
      throw new Error('No active session found - user must be authenticated to run tests');
    }
    
    // Test getting current user
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) {
      throw new Error(`User retrieval failed: ${userError.message}`);
    }
    
    if (!user.user) {
      throw new Error('No user data found in session');
    }
    
    console.log('Authentication test passed - User ID:', user.user.id);
  }

  async function runDatabaseConnectivityTest() {
    console.log('Running database connectivity test...');
    
    // Test basic database connectivity by querying profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
      
    if (error) {
      throw new Error(`Database connectivity failed: ${error.message}`);
    }
    
    console.log('Database connectivity test passed');
  }

  async function runUserProfileTest() {
    console.log('Running user profile test...');
    
    // Get current user first
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('No authenticated user found for profile test');
    }
    
    // Test profile access
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single();
      
    if (error) {
      throw new Error(`Profile access failed: ${error.message}`);
    }
    
    if (!profile) {
      throw new Error('User profile not found in database');
    }
    
    console.log('User profile test passed - Profile found for user:', user.user.id);
  }

  async function runUserRoleTest() {
    console.log('Running user role test...');
    
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('No authenticated user found for role test');
    }
    
    // Test user roles access
    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.user.id);
      
    if (error) {
      throw new Error(`Role check failed: ${error.message}`);
    }
    
    if (!roles || roles.length === 0) {
      throw new Error('No user roles found - user roles may not be properly configured');
    }
    
    console.log('User role test passed - Found roles:', roles.map(r => r.role).join(', '));
  }

  async function runNotificationsTableTest() {
    console.log('Running notifications table test...');
    
    // Test notifications table access
    const { data, error } = await supabase
      .from('notifications')
      .select('count')
      .limit(1);
      
    if (error) {
      throw new Error(`Notifications table access failed: ${error.message}`);
    }
    
    console.log('Notifications table test passed');
  }

  async function runContentPostsTableTest() {
    console.log('Running content posts table test...');
    
    // Test content_posts table access
    const { data, error } = await supabase
      .from('content_posts')
      .select('count')
      .limit(1);
      
    if (error) {
      throw new Error(`Content posts table access failed: ${error.message}`);
    }
    
    console.log('Content posts table test passed');
  }

  async function runBrandDealsTableTest() {
    console.log('Running brand deals table test...');
    
    // Test brand_deals table access
    const { data, error } = await supabase
      .from('brand_deals')
      .select('count')
      .limit(1);
      
    if (error) {
      throw new Error(`Brand deals table access failed: ${error.message}`);
    }
    
    console.log('Brand deals table test passed');
  }

  async function runTestResultsTableTest() {
    console.log('Running test results table test...');
    
    // Test the test_results table we just created
    const { data, error } = await supabase
      .from('test_results')
      .select('count')
      .limit(1);
      
    if (error) {
      throw new Error(`Test results table access failed: ${error.message}`);
    }
    
    console.log('Test results table test passed');
  }

  // Define comprehensive test suites
  const testSuites = [
    {
      name: 'Authentication & Security',
      category: 'auth',
      tests: [
        { name: 'Session Validation', fn: runAuthenticationTest },
        { name: 'User Profile Access', fn: runUserProfileTest },
        { name: 'User Role Verification', fn: runUserRoleTest }
      ]
    },
    {
      name: 'Database Connectivity',
      category: 'database',
      tests: [
        { name: 'Basic Connectivity', fn: runDatabaseConnectivityTest },
        { name: 'Notifications Table', fn: runNotificationsTableTest },
        { name: 'Content Posts Table', fn: runContentPostsTableTest },
        { name: 'Brand Deals Table', fn: runBrandDealsTableTest },
        { name: 'Test Results Table', fn: runTestResultsTableTest }
      ]
    }
  ];

  // Run all tests mutation with improved error handling
  const runAllTestsMutation = useMutation({
    mutationFn: async () => {
      console.log('Starting comprehensive test suite...');
      setIsRunningTests(true);
      setTestProgress(0);
      
      const allTests = testSuites.flatMap(suite => 
        suite.tests.map(test => ({ ...test, category: suite.category }))
      );
      
      let completedTests = 0;
      
      for (const test of allTests) {
        setCurrentTest(test.name);
        const startTime = Date.now();
        
        try {
          await test.fn();
          const duration = Date.now() - startTime;
          
          // Save successful test result
          const { error: insertError } = await supabase.from('test_results').insert({
            test_id: `${test.category}_${test.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`,
            test_name: test.name,
            category: test.category,
            status: 'passed',
            duration,
            executed_at: new Date().toISOString()
          });
          
          if (insertError) {
            console.error('Failed to save test result:', insertError);
          }
          
          toast({
            title: "✅ Test Passed",
            description: `${test.name} completed successfully (${duration}ms)`
          });
          
        } catch (error) {
          const duration = Date.now() - startTime;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          
          // Save failed test result
          const { error: insertError } = await supabase.from('test_results').insert({
            test_id: `${test.category}_${test.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`,
            test_name: test.name,
            category: test.category,
            status: 'failed',
            duration,
            error_message: errorMessage,
            executed_at: new Date().toISOString()
          });
          
          if (insertError) {
            console.error('Failed to save test result:', insertError);
          }
          
          console.error(`Test failed: ${test.name}`, error);
          
          toast({
            title: "❌ Test Failed",
            description: `${test.name}: ${errorMessage}`,
            variant: "destructive"
          });
        }
        
        completedTests++;
        setTestProgress((completedTests / allTests.length) * 100);
        
        // Small delay between tests to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setIsRunningTests(false);
      setCurrentTest(null);
      setTestProgress(0);
      
      // Refresh test results
      queryClient.invalidateQueries({ queryKey: ['adminTestResults'] });
      
      const passedCount = allTests.length - (testResults?.filter(t => t.status === 'failed').length || 0);
      
      toast({
        title: "🎯 Test Suite Complete",
        description: `Executed ${allTests.length} tests. Check results below for details.`
      });
    }
  });

  // Calculate test metrics
  const testMetrics: TestMetrics = React.useMemo(() => {
    if (!testResults) {
      return {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        averageDuration: 0,
        successRate: 0,
        categoryCoverage: {},
        trendData: []
      };
    }

    const totalTests = testResults.length;
    const passedTests = testResults.filter(t => t.status === 'passed').length;
    const failedTests = testResults.filter(t => t.status === 'failed').length;
    const averageDuration = testResults.reduce((sum, t) => sum + t.duration, 0) / totalTests || 0;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    const categoryCoverage = testResults.reduce((acc, test) => {
      acc[test.category] = (acc[test.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const trendData = testResults.reduce((acc, test) => {
      const date = new Date(test.executed_at).toISOString().split('T')[0];
      const existing = acc.find(item => item.date === date);

      if (existing) {
        existing.total++;
        if (test.status === 'passed') existing.passed++;
        if (test.status === 'failed') existing.failed++;
      } else {
        acc.push({
          date,
          total: 1,
          passed: test.status === 'passed' ? 1 : 0,
          failed: test.status === 'failed' ? 1 : 0
        });
      }

      return acc;
    }, [] as Array<{ date: string; passed: number; failed: number; total: number; }>)
    .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalTests,
      passedTests,
      failedTests,
      averageDuration,
      successRate,
      categoryCoverage,
      trendData
    };
  }, [testResults]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Testing Dashboard</h1>
            <p className="text-muted-foreground">Monitor and execute comprehensive feature tests</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => runAllTestsMutation.mutate()} 
              disabled={isRunningTests}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="h-4 w-4 mr-2" />
              {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Test Progress */}
        {isRunningTests && (
          <Card>
            <CardHeader>
              <CardTitle>Test Execution Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={testProgress} className="w-full" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progress: {Math.round(testProgress)}%</span>
                  <span>Running comprehensive tests...</span>
                </div>
                {currentTest && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 animate-spin text-blue-500" />
                    <span>Currently testing: {currentTest}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <TestTube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testMetrics.totalTests}</div>
              <p className="text-xs text-muted-foreground">Executed in {selectedTimeRange}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Passed Tests</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{testMetrics.passedTests}</div>
              <p className="text-xs text-muted-foreground">Success rate: {testMetrics.successRate.toFixed(1)}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Tests</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{testMetrics.failedTests}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(testMetrics.averageDuration)}ms</div>
              <p className="text-xs text-muted-foreground">Per test execution</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="results" className="space-y-6">
          <TabsList>
            <TabsTrigger value="results">Test Results</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex gap-2">
                {['24h', '7d', '30d'].map((range) => (
                  <Button
                    key={range}
                    variant={selectedTimeRange === range ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTimeRange(range)}
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Test Results</CardTitle>
                <CardDescription>Detailed test execution history and outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                {testResults && testResults.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Executed At</TableHead>
                        <TableHead>Error Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testResults.slice(0, 20).map((test) => (
                        <TableRow key={test.id}>
                          <TableCell className="font-medium">{test.test_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{test.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={test.status === 'passed' ? 'default' : 'destructive'}>
                              {test.status === 'passed' ? '✅ Passed' : '❌ Failed'}
                            </Badge>
                          </TableCell>
                          <TableCell>{test.duration}ms</TableCell>
                          <TableCell>{new Date(test.executed_at).toLocaleString()}</TableCell>
                          <TableCell>
                            {test.error_message && (
                              <span className="text-sm text-red-600 truncate block max-w-xs" title={test.error_message}>
                                {test.error_message}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No test results yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Click "Run All Tests" to start testing your system functionality
                    </p>
                    <Button onClick={() => runAllTestsMutation.mutate()} disabled={isRunningTests}>
                      <Play className="h-4 w-4 mr-2" />
                      Run First Test
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Execution Trends</CardTitle>
                  <CardDescription>Daily test results over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {testMetrics.trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={testMetrics.trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="passed" stroke="#22c55e" strokeWidth={2} name="Passed" />
                        <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} name="Failed" />
                        <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No trend data available - run some tests to see analytics
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Coverage</CardTitle>
                  <CardDescription>Tests by feature category</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(testMetrics.categoryCoverage).length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={Object.entries(testMetrics.categoryCoverage).map(([key, value]) => ({ category: key, count: value }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No category data available - run tests to see coverage breakdown
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminTesting;
