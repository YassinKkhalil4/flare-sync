
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { TestRunner } from '@/tests/TestRunner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Download, RefreshCw, TestTube, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

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
  
  const { data: testResults, isLoading, refetch } = useQuery({
    queryKey: ['adminTestResults', selectedTimeRange],
    queryFn: async () => {
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

      if (error) throw error;
      return data as TestResultData[];
    }
  });

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

    // Category coverage
    const categoryCoverage = testResults.reduce((acc, test) => {
      acc[test.category] = (acc[test.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Trend data - group by date
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

  const exportTestReport = async () => {
    if (!testResults) return;
    
    const csvData = [
      ['Test Name', 'Category', 'Status', 'Duration (ms)', 'Executed At', 'Error Message'],
      ...testResults.map(test => [
        test.test_name,
        test.category,
        test.status,
        test.duration.toString(),
        test.executed_at,
        test.error_message || ''
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportTestReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Test Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
              <p className="text-xs text-muted-foreground">Needs attention</p>
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <TestTube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(testMetrics.categoryCoverage).length}</div>
              <p className="text-xs text-muted-foreground">Feature areas covered</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="runner" className="space-y-6">
          <TabsList>
            <TabsTrigger value="runner">Test Runner</TabsTrigger>
            <TabsTrigger value="results">Test Results</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="runner">
            <TestRunner />
          </TabsContent>

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
                <CardDescription>Detailed test execution history</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Executed At</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testResults?.slice(0, 50).map((test) => (
                      <TableRow key={test.id}>
                        <TableCell className="font-medium">{test.test_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{test.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={test.status === 'passed' ? 'default' : 'destructive'}>
                            {test.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{test.duration}ms</TableCell>
                        <TableCell>{new Date(test.executed_at).toLocaleString()}</TableCell>
                        <TableCell>
                          {test.error_message && (
                            <span className="text-sm text-red-600 truncate block max-w-xs">
                              {test.error_message}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={testMetrics.trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="passed" stroke="#22c55e" strokeWidth={2} />
                      <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} />
                      <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Coverage</CardTitle>
                  <CardDescription>Tests by feature category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(testMetrics.categoryCoverage).map(([key, value]) => ({ category: key, count: value }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
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
