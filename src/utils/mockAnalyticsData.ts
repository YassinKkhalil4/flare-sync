
// Mock data for analytics

// Generate realistic follower growth data
export const generateFollowerGrowthData = (days: number = 30) => {
  const data = [];
  const today = new Date();
  const startingFollowers = 10000 + Math.floor(Math.random() * 5000);
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Generate growth with some randomness and general upward trend
    const dailyGrowth = Math.floor(Math.random() * 80) - 10; // Between -10 and 70
    const cumulativeGrowth = Math.floor((days - i) * 25) + Math.floor(Math.random() * 100); // Steady growth over time
    
    data.push({
      date: formattedDate,
      followers: startingFollowers + cumulativeGrowth + dailyGrowth
    });
  }
  
  return data;
};

// Generate engagement data
export const generateEngagementData = (days: number = 30) => {
  const data = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Weekend engagement is typically higher
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseRate = isWeekend ? 3.2 : 2.8;
    
    // Add some randomness
    const randomFactor = (Math.random() * 1.5) - 0.5; // Between -0.5 and 1.0
    
    data.push({
      date: formattedDate,
      rate: parseFloat((baseRate + randomFactor).toFixed(2))
    });
  }
  
  return data;
};

// Generate post performance data
export const generatePostPerformanceData = (count: number = 10) => {
  const postTypes = ['Image', 'Video', 'Carousel', 'Story', 'Reel'];
  const data = [];
  
  for (let i = 0; i < count; i++) {
    const postType = postTypes[Math.floor(Math.random() * postTypes.length)];
    const likes = Math.floor(Math.random() * 1000) + 100;
    const comments = Math.floor(likes * (Math.random() * 0.2 + 0.05)); // 5-25% of likes
    const shares = Math.floor(likes * (Math.random() * 0.1 + 0.01)); // 1-11% of likes
    
    data.push({
      id: `post-${i + 1}`,
      title: `${postType} Post ${i + 1}`,
      type: postType,
      likes,
      comments,
      shares,
      impressions: likes + Math.floor(Math.random() * 2000),
      date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString() // Last 'count' days
    });
  }
  
  return data;
};

// Generate platform-specific data
export const generatePlatformData = () => {
  return [
    {
      platform: 'Instagram',
      followers: 12500 + Math.floor(Math.random() * 1000),
      engagementRate: parseFloat((Math.random() * 2 + 2).toFixed(2)), // 2-4%
      posts: 78 + Math.floor(Math.random() * 10),
      growth: parseFloat((Math.random() * 3 + 1).toFixed(1)) // 1-4%
    },
    {
      platform: 'TikTok',
      followers: 25000 + Math.floor(Math.random() * 2000),
      engagementRate: parseFloat((Math.random() * 3 + 4).toFixed(2)), // 4-7%
      posts: 120 + Math.floor(Math.random() * 15),
      growth: parseFloat((Math.random() * 5 + 3).toFixed(1)) // 3-8%
    },
    {
      platform: 'YouTube',
      followers: 8000 + Math.floor(Math.random() * 1000),
      engagementRate: parseFloat((Math.random() * 1.5 + 1).toFixed(2)), // 1-2.5%
      posts: 45 + Math.floor(Math.random() * 5),
      growth: parseFloat((Math.random() * 2 + 0.5).toFixed(1)) // 0.5-2.5%
    },
    {
      platform: 'Twitter',
      followers: 5500 + Math.floor(Math.random() * 500),
      engagementRate: parseFloat((Math.random() * 1 + 0.5).toFixed(2)), // 0.5-1.5%
      posts: 210 + Math.floor(Math.random() * 20),
      growth: parseFloat((Math.random() * 1 + 0.2).toFixed(1)) // 0.2-1.2%
    }
  ];
};

// Generate audience demographics
export const generateAudienceDemographics = () => {
  return {
    age: [
      { group: '13-17', percentage: Math.floor(Math.random() * 8) + 2 }, // 2-10%
      { group: '18-24', percentage: Math.floor(Math.random() * 15) + 20 }, // 20-35%
      { group: '25-34', percentage: Math.floor(Math.random() * 15) + 30 }, // 30-45%
      { group: '35-44', percentage: Math.floor(Math.random() * 15) + 10 }, // 10-25%
      { group: '45-54', percentage: Math.floor(Math.random() * 8) + 2 }, // 2-10%
      { group: '55+', percentage: Math.floor(Math.random() * 5) + 2 }, // 2-7%
    ],
    gender: [
      { group: 'Male', percentage: Math.floor(Math.random() * 30) + 35 }, // 35-65%
      { group: 'Female', percentage: Math.floor(Math.random() * 30) + 35 }, // 35-65%
      { group: 'Other', percentage: Math.floor(Math.random() * 3) + 1 }, // 1-4%
    ],
    locations: [
      { country: 'United States', percentage: Math.floor(Math.random() * 20) + 30 }, // 30-50%
      { country: 'United Kingdom', percentage: Math.floor(Math.random() * 10) + 10 }, // 10-20%
      { country: 'Canada', percentage: Math.floor(Math.random() * 8) + 5 }, // 5-13%
      { country: 'Australia', percentage: Math.floor(Math.random() * 5) + 5 }, // 5-10%
      { country: 'Germany', percentage: Math.floor(Math.random() * 5) + 3 }, // 3-8%
      { country: 'Other', percentage: 100 - (Math.floor(Math.random() * 20) + 30) - (Math.floor(Math.random() * 10) + 10) - (Math.floor(Math.random() * 8) + 5) - (Math.floor(Math.random() * 5) + 5) - (Math.floor(Math.random() * 5) + 3) } // Remaining percentage
    ]
  };
};

// Generate optimal posting times heatmap
export const generatePostingTimesHeatmap = () => {
  const heatmap = [];
  
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      // Create patterns
      let value = Math.random() * 0.3; // Base random value
      
      // Working hours have higher engagement on weekdays
      if (day >= 1 && day <= 5 && hour >= 8 && hour <= 20) {
        value += 0.2;
      }
      
      // Peak hours (morning, lunch, evening)
      if ((hour === 8 || hour === 12 || hour === 17 || hour === 19) && day >= 1 && day <= 5) {
        value += 0.3;
      }
      
      // Weekend patterns
      if ((day === 0 || day === 6) && (hour >= 10 && hour <= 18)) {
        value += 0.25;
      }
      
      // Night time dip
      if (hour >= 23 || hour <= 5) {
        value = Math.random() * 0.2;
      }
      
      // Cap to 0-1 range
      value = Math.min(Math.max(value, 0), 1);
      
      heatmap.push({
        day,
        hour,
        value
      });
    }
  }
  
  return heatmap;
};

