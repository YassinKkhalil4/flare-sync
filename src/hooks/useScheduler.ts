
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { ScheduledPost } from '@/types/database';
import { aiServices } from '@/services/api';

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

  // Analyze schedule to get optimal posting times
  const analyzeSchedule = async (params: AnalyzeScheduleParams) => {
    try {
      setIsAnalyzing(true);
      
      // In a real implementation, this would call the AI service
      // For now, we'll mock the response with realistic data
      
      // Mock implementation - would normally call the backend AI service
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      const mockData: SchedulingData = {
        optimalTimes: [
          { day: 'Monday', times: ['8:30 AM', '7:00 PM'] },
          { day: 'Tuesday', times: ['12:00 PM'] },
          { day: 'Wednesday', times: ['10:00 AM', '4:30 PM'] },
          { day: 'Thursday', times: ['9:00 AM', '8:00 PM'] },
          { day: 'Friday', times: ['12:30 PM', '5:00 PM'] },
          { day: 'Saturday', times: ['11:00 AM'] },
          { day: 'Sunday', times: ['3:00 PM'] },
        ],
        heatmap: generateMockHeatmapData(),
        recommendations: [
          'Your audience is most active around evening time on weekdays.',
          'Engagement rates are highest on Wednesday and Thursday.',
          'Weekend posting tends to get less engagement, but Sunday afternoon shows potential.',
          'Consider scheduling posts between 10 AM - 12 PM for maximum reach.',
          'Posts with videos perform better when posted in the evening (6 PM - 8 PM).',
        ]
      };
      
      setSchedulingData(mockData);
      
      toast({
        title: 'Schedule Analyzed',
        description: `Found optimal posting times for ${params.platform}`,
      });
      
      return mockData;
      
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

  // Generate mock heatmap data
  const generateMockHeatmapData = (): HeatmapData[] => {
    const heatmapData: HeatmapData[] = [];
    
    // Generate data for each day of the week and each hour
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        // Create engagement patterns
        let value = Math.random() * 0.3; // Base random value
        
        // Higher engagement during working hours on weekdays
        if (day >= 1 && day <= 5 && hour >= 8 && hour <= 20) {
          value += 0.2;
        }
        
        // Peak hours
        if ((hour === 8 || hour === 12 || hour === 17 || hour === 19) && day >= 1 && day <= 5) {
          value += 0.3;
        }
        
        // Weekend patterns
        if ((day === 0 || day === 6) && (hour >= 10 && hour <= 16)) {
          value += 0.25;
        }
        
        // Evening dip
        if (hour >= 22 || hour <= 5) {
          value = Math.random() * 0.2;
        }
        
        // Cap to 0-1 range
        value = Math.min(Math.max(value, 0), 1);
        
        heatmapData.push({
          day,
          hour,
          value
        });
      }
    }
    
    return heatmapData;
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
