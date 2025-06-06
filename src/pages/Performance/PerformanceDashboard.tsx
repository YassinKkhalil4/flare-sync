
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, Shield, Database, Image, Clock, Gauge } from 'lucide-react';
import CacheManager from '@/components/performance/CacheManager';
import ImageOptimizer from '@/components/performance/ImageOptimizer';
import TwoFactorAuth from '@/components/security/TwoFactorAuth';

const PerformanceDashboard: React.FC = () => {
  const [performanceScore, setPerformanceScore] = useState(85);
  const [securityScore, setSecurityScore] = useState(78);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const performanceMetrics = [
    { name: 'Page Load Time', value: '2.3s', score: 85, status: 'good' },
    { name: 'First Contentful Paint', value: '1.2s', score: 92, status: 'excellent' },
    { name: 'Largest Contentful Paint', value: '2.8s', score: 78, status: 'needs-improvement' },
    { name: 'Cumulative Layout Shift', value: '0.05', score: 95, status: 'excellent' },
  ];

  const securityMetrics = [
    { name: 'HTTPS Enabled', status: 'enabled' },
    { name: 'Two-Factor Auth', status: is2FAEnabled ? 'enabled' : 'disabled' },
    { name: 'Session Security', status: 'enabled' },
    { name: 'Data Encryption', status: 'enabled' },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      case 'enabled': return 'text-green-600';
      case 'disabled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleEnable2FA = async (code: string): Promise<boolean> => {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        setIs2FAEnabled(true);
        setSecurityScore(90);
        resolve(true);
      }, 1000);
    });
  };

  const handleDisable2FA = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setIs2FAEnabled(false);
        setSecurityScore(78);
        resolve(true);
      }, 1000);
    });
  };

  const handleGenerateBackupCodes = async (): Promise<string[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const codes = Array.from({ length: 8 }, () => 
          Math.random().toString(36).substring(2, 8).toUpperCase()
        );
        resolve(codes);
      }, 1000);
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Performance & Security</h1>
        <p className="text-muted-foreground">
          Monitor and optimize your application's performance and security
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(performanceScore)}`}>
              {performanceScore}/100
            </div>
            <Progress value={performanceScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(securityScore)}`}>
              {securityScore}/100
            </div>
            <Progress value={securityScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Load Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">2.3s</div>
            <p className="text-xs text-muted-foreground">Average page load</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="cache" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Cache
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Optimization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals</CardTitle>
              <CardDescription>
                Key metrics that affect user experience and search rankings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{metric.name}</div>
                      <div className="text-sm text-muted-foreground">{metric.value}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getScoreBadgeVariant(metric.score)}>
                        {metric.score}
                      </Badge>
                      <span className={`text-sm capitalize ${getStatusColor(metric.status)}`}>
                        {metric.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Status</CardTitle>
                <CardDescription>
                  Current security features and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="font-medium">{metric.name}</div>
                      <Badge 
                        variant={metric.status === 'enabled' ? 'default' : 'destructive'}
                        className="capitalize"
                      >
                        {metric.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <TwoFactorAuth
              isEnabled={is2FAEnabled}
              onEnable={handleEnable2FA}
              onDisable={handleDisable2FA}
              onGenerateBackupCodes={handleGenerateBackupCodes}
            />
          </div>
        </TabsContent>

        <TabsContent value="cache">
          <CacheManager />
        </TabsContent>

        <TabsContent value="optimization">
          <ImageOptimizer
            images={[]}
            onOptimized={(optimizedImages) => {
              console.log('Optimized images:', optimizedImages);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;
