
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  engagement: {
    date: string;
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  }[];
  platforms: {
    platform: string;
    followers: number;
    engagement: number;
    posts: number;
    avgLikes: number;
    avgComments: number;
    growthRate: number;
    color: string;
  }[];
  insights: {
    id: string;
    title: string;
    type: 'photo' | 'video' | 'text' | 'carousel';
    platform: string;
    publishedAt: string;
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    engagementRate: number;
    hashtags: string[];
    performance: 'excellent' | 'good' | 'average' | 'poor';
  }[];
  topHashtags: {
    tag: string;
    usage: number;
    performance: number;
  }[];
  bestTimes: {
    time: string;
    day: string;
    score: number;
  }[];
}

export const useAnalytics = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMockData = (): AnalyticsData => {
    // Generate engagement data for the last 30 days
    const engagementData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        likes: Math.floor(Math.random() * 1000) + 100,
        comments: Math.floor(Math.random() * 100) + 10,
        shares: Math.floor(Math.random() * 50) + 5,
        reach: Math.floor(Math.random() * 5000) + 500,
      };
    });

    // Mock platform data
    const platformData = [
      {
        platform: 'instagram',
        followers: 12500,
        engagement: 4.2,
        posts: 45,
        avgLikes: 320,
        avgComments: 28,
        growthRate: 8.5,
        color: '#E4405F'
      },
      {
        platform: 'twitter',
        followers: 8900,
        engagement: 2.8,
        posts: 78,
        avgLikes: 125,
        avgComments: 15,
        growthRate: 12.3,
        color: '#1DA1F2'
      },
      {
        platform: 'facebook',
        followers: 15200,
        engagement: 3.1,
        posts: 32,
        avgLikes: 180,
        avgComments: 22,
        growthRate: -2.1,
        color: '#1877F2'
      },
      {
        platform: 'youtube',
        followers: 4300,
        engagement: 6.8,
        posts: 12,
        avgLikes: 890,
        avgComments: 45,
        growthRate: 15.7,
        color: '#FF0000'
      }
    ];

    // Mock content insights
    const contentInsights = Array.from({ length: 20 }, (_, i) => ({
      id: `content-${i}`,
      title: `Post ${i + 1}: Amazing content that performs well`,
      type: ['photo', 'video', 'text', 'carousel'][Math.floor(Math.random() * 4)] as any,
      platform: ['instagram', 'twitter', 'facebook', 'youtube'][Math.floor(Math.random() * 4)],
      publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      likes: Math.floor(Math.random() * 1000) + 50,
      comments: Math.floor(Math.random() * 100) + 5,
      shares: Math.floor(Math.random() * 50) + 2,
      reach: Math.floor(Math.random() * 5000) + 200,
      engagementRate: Math.random() * 8 + 1,
      hashtags: ['#content', '#social', '#engagement', '#marketing'].slice(0, Math.floor(Math.random() * 4) + 1),
      performance: ['excellent', 'good', 'average', 'poor'][Math.floor(Math.random() * 4)] as any
    }));

    // Mock hashtag performance
    const topHashtags = [
      { tag: 'socialmedia', usage: 45, performance: 6.8 },
      { tag: 'marketing', usage: 38, performance: 5.2 },
      { tag: 'content', usage: 52, performance: 4.9 },
      { tag: 'engagement', usage: 29, performance: 7.1 },
      { tag: 'digital', usage: 33, performance: 3.8 },
      { tag: 'strategy', usage: 24, performance: 5.5 },
      { tag: 'growth', usage: 18, performance: 8.2 },
      { tag: 'analytics', usage: 15, performance: 6.3 },
      { tag: 'insights', usage: 21, performance: 4.7 }
    ];

    // Mock best posting times
    const bestTimes = [
      { time: '9:00 AM', day: 'Monday', score: 85 },
      { time: '2:00 PM', day: 'Wednesday', score: 92 },
      { time: '6:00 PM', day: 'Friday', score: 78 },
      { time: '11:00 AM', day: 'Saturday', score: 88 },
      { time: '8:00 PM', day: 'Sunday', score: 73 },
      { time: '1:00 PM', day: 'Tuesday', score: 81 },
      { time: '4:00 PM', day: 'Thursday', score: 76 }
    ];

    return {
      engagement: engagementData,
      platforms: platformData,
      insights: contentInsights,
      topHashtags,
      bestTimes
    };
  };

  const loadAnalytics = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // For now, we'll use mock data
      // In a real implementation, this would fetch from Supabase and analyze real data
      const mockData = generateMockData();
      setAnalyticsData(mockData);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  return {
    analyticsData,
    isLoading,
    error,
    refreshAnalytics: loadAnalytics
  };
};
