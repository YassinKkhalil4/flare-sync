
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Re-export the supabase client from the integrations folder
import { supabase as integrationSupabase } from '@/integrations/supabase/client';

// Re-export for backward compatibility
export const supabase = integrationSupabase;

// Helper functions for session persistence
export const persistSession = (session: any) => {
  if (session) {
    try {
      localStorage.setItem('supabase_session', JSON.stringify(session));
    } catch (error) {
      // Silent error handling
    }
  } else {
    try {
      localStorage.removeItem('supabase_session');
    } catch (error) {
      // Silent error handling
    }
  }
};

export const getPersistedSession = () => {
  try {
    const sessionStr = localStorage.getItem('supabase_session');
    if (!sessionStr) return null;
    
    const session = JSON.parse(sessionStr);
    return session;
  } catch (error) {
    return null;
  }
};

// Function to check if we're using a real Supabase client
export const isRealSupabaseClient = () => true;

// Define plan types for individual users and agencies
export type UserPlanTier = 'basic' | 'pro' | 'enterprise';
export type AgencyPlanTier = 'agency-small' | 'agency-medium' | 'agency-large';
export type UserPlan = UserPlanTier | AgencyPlanTier;

// Plan features and limits
export interface PlanFeatures {
  maxPosts: number;
  maxUsers: number;
  maxSocialAccounts: number;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  teamCollaboration: boolean;
  contentGeneration: boolean;
  automatedScheduling: boolean;
}

// Plan pricing
export interface PlanPricing {
  monthly: number;
  yearly: number;
  setupFee?: number;
}

// Define plan details mapping
export const PLAN_DETAILS: Record<UserPlan, { features: PlanFeatures, pricing: PlanPricing }> = {
  'basic': {
    features: {
      maxPosts: 30,
      maxUsers: 1,
      maxSocialAccounts: 2,
      advancedAnalytics: false,
      prioritySupport: false,
      customBranding: false,
      apiAccess: false,
      teamCollaboration: false,
      contentGeneration: false,
      automatedScheduling: false
    },
    pricing: {
      monthly: 25,
      yearly: 250 // ~2 months free
    }
  },
  'pro': {
    features: {
      maxPosts: 120,
      maxUsers: 3,
      maxSocialAccounts: 5,
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: false,
      apiAccess: false,
      teamCollaboration: true,
      contentGeneration: true,
      automatedScheduling: false
    },
    pricing: {
      monthly: 59,
      yearly: 590 // ~2 months free
    }
  },
  'enterprise': {
    features: {
      maxPosts: 500,
      maxUsers: 10,
      maxSocialAccounts: 10,
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: true,
      apiAccess: true,
      teamCollaboration: true,
      contentGeneration: true,
      automatedScheduling: true
    },
    pricing: {
      monthly: 199,
      yearly: 1990 // ~2 months free
    }
  },
  'agency-small': {
    features: {
      maxPosts: 1000,
      maxUsers: 25,
      maxSocialAccounts: 20,
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: true,
      apiAccess: true,
      teamCollaboration: true,
      contentGeneration: true,
      automatedScheduling: true
    },
    pricing: {
      monthly: 399,
      yearly: 3990,
      setupFee: 499
    }
  },
  'agency-medium': {
    features: {
      maxPosts: 5000,
      maxUsers: 100,
      maxSocialAccounts: 50,
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: true,
      apiAccess: true,
      teamCollaboration: true,
      contentGeneration: true,
      automatedScheduling: true
    },
    pricing: {
      monthly: 999,
      yearly: 9990,
      setupFee: 999
    }
  },
  'agency-large': {
    features: {
      maxPosts: 20000,
      maxUsers: 500,
      maxSocialAccounts: 100,
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: true,
      apiAccess: true,
      teamCollaboration: true,
      contentGeneration: true,
      automatedScheduling: true
    },
    pricing: {
      monthly: 2499,
      yearly: 24990,
      setupFee: 1999
    }
  }
};

// Function to check if a plan is an agency plan
export const isAgencyPlan = (plan: UserPlan): boolean => {
  return plan.startsWith('agency-');
};

// Function to ensure plan is one of the allowed values
export const ensureValidPlan = (plan: string): UserPlan => {
  const validPlans: UserPlan[] = [
    'basic', 'pro', 'enterprise', 
    'agency-small', 'agency-medium', 'agency-large'
  ];
  
  if (validPlans.includes(plan as UserPlan)) {
    return plan as UserPlan;
  }
  return 'basic'; // Default to basic for any invalid value
};

// Function to get plan features
export const getPlanFeatures = (plan: UserPlan): PlanFeatures => {
  return PLAN_DETAILS[plan].features;
};

// Function to get plan pricing
export const getPlanPricing = (plan: UserPlan): PlanPricing => {
  return PLAN_DETAILS[plan].pricing;
};

// Extended profile interface that includes fields we need
export interface ExtendedProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  role: 'creator' | 'brand';
  plan: UserPlan;
  avatar?: string;
  user_metadata?: Record<string, any>;
}

// Function to convert database profile to extended profile
export const mapDatabaseProfileToExtended = (dbProfile: any, email: string = ''): ExtendedProfile => {
  return {
    id: dbProfile.id,
    email: email,
    name: dbProfile.full_name || 'User',
    username: dbProfile.username || '',
    role: dbProfile.role || 'creator',
    plan: ensureValidPlan(dbProfile.plan || 'basic'), // Changed default from 'free' to 'basic'
    avatar: dbProfile.avatar_url,
    user_metadata: {}
  };
};
