
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { ScheduledPost } from '@/types/database';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

// Define interfaces for scheduling data
interface OptimalTime {
  day: string;
  times: string[];
}

interface HeatmapData {
  day: number; // 0-6 for Sunday-Saturday
  hour: number; // 0-23
  value: number; // 0-1 for engagement level
}

interface SchedulingData {
  optimalTimes: OptimalTime[];
  heatmap: HeatmapData[];
  recommendations: string[];
}

interface AnalyzeScheduleParams {
  platform: string;
  contentType: string;
  audienceLocation: string;
  postCount: number;
  startDate?: string;
  endDate?: string;
}

export const useScheduler = () => {
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [schedulingData, setSchedulingData] = useState<SchedulingData | null>(null);

  // Fetch scheduled posts
  const {
    data: scheduledPosts,
    isLoading: isLoadingScheduledPosts,
    refetch: refreshScheduledPosts
  } = useQuery({
    queryKey: ['scheduledPosts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_for', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      return data as ScheduledPost[];
    },
    enabled: !!user,
  });

  // Analyze schedule to get optimal posting times based on actual data
  const analyzeSchedule = async (params: AnalyzeScheduleParams) => {
    try {
      setIsAnalyzing(true);
      
      if (!user) throw new Error('User not authenticated');
      
      // Get historical posts for analysis
      const thirtyDaysAgo = subDays(new Date(), 30);
      const { data: historicalPosts, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', params.platform)
        .eq('status', 'published')
        .gte('scheduled_for', thirtyDaysAgo.toISOString());
      
      if (error) throw error;
      
      // Analyze posting patterns from historical data
      const analysisData = analyzeHistoricalData(historicalPosts || []);
      
      setSchedulingData(analysisData);
      
      toast({
        title: 'Schedule Analyzed',
        description: `Analyzed ${historicalPosts?.length || 0} historical posts for ${params.platform}`,
      });
      
      return analysisData;
      
    } catch (error) {
      console.error('Error analyzing schedule:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Failed to analyze your posting schedule.',
      });
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Analyze historical data to generate recommendations
  const analyzeHistoricalData = (posts: ScheduledPost[]): SchedulingData => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const hourCounts: { [key: string]: number } = {};
    const dayCounts: { [key: string]: number } = {};
    const heatmapData: HeatmapData[] = [];
    
    // Initialize counters
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`;
        hourCounts[key] = 0;
      }
      dayCounts[day.toString()] = 0;
    }
    
    // Count posts by day and hour
    posts.forEach(post => {
      const date = new Date(post.scheduled_for);
      const day = date.getDay();
      const hour = date.getHours();
      const key = `${day}-${hour}`;
      
      hourCounts[key]++;
      dayCounts[day.toString()]++;
    });
    
    // Generate heatmap data
    const maxCount = Math.max(...Object.values(hourCounts));
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`;
        const count = hourCounts[key];
        const value = maxCount > 0 ? count / maxCount : 0;
        
        heatmapData.push({
          day,
          hour,
          value
        });
      }
    }
    
    // Find optimal times (top 2 hours per day with most posts)
    const optimalTimes: OptimalTime[] = [];
    for (let day = 0; day < 7; day++) {
      const dayHours = [];
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`;
        if (hourCounts[key] > 0) {
          dayHours.push({ hour, count: hourCounts[key] });
        }
      }
      
      // Sort by count and take top 2
      dayHours.sort((a, b) => b.count - a.count);
      const topHours = dayHours.slice(0, 2).map(h => 
        format(new Date().setHours(h.hour, 0, 0, 0), 'h:mm a')
      );
      
      if (topHours.length > 0) {
        optimalTimes.push({
          day: dayNames[day],
          times: topHours
        });
      }
    }
    
    // Generate recommendations based on data
    const recommendations: string[] = [];
    
    if (posts.length === 0) {
      recommendations.push('Start posting regularly to build engagement data.');
      recommendations.push('Try posting at different times to find your optimal schedule.');
    } else {
      const totalPosts = posts.length;
      const avgPostsPerDay = totalPosts / 30;
      
      if (avgPostsPerDay < 1) {
        recommendations.push('Consider posting more frequently to increase engagement.');
      }
      
      // Find most active day
      const mostActiveDay = Object.entries(dayCounts)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (mostActiveDay && parseInt(mostActiveDay[1].toString()) > 0) {
        recommendations.push(`${dayNames[parseInt(mostActiveDay[0])]} appears to be your most active posting day.`);
      }
      
      // Check posting consistency
      const uniqueDays = new Set(posts.map(p => new Date(p.scheduled_for).getDay())).size;
      if (uniqueDays < 3) {
        recommendations.push('Try posting on different days of the week to reach a broader audience.');
      }
    }
    
    return {
      optimalTimes,
      heatmap: heatmapData,
      recommendations
    };
  };

  return {
    analyzeSchedule,
    isAnalyzing,
    schedulingData,
    scheduledPosts,
    isLoadingScheduledPosts,
    refreshScheduledPosts,
  };
};
