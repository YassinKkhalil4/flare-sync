
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          name: string | null
          role: 'creator' | 'brand'
          plan: 'free' | 'basic' | 'pro'
          avatar_url: string | null
          stripe_customer_id: string | null
          subscription_id: string | null
          subscription_status: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          role: 'creator' | 'brand'
          plan?: 'free' | 'basic' | 'pro'
          avatar_url?: string | null
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          role?: 'creator' | 'brand'
          plan?: 'free' | 'basic' | 'pro'
          avatar_url?: string | null
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      social_profiles: {
        Row: {
          id: string
          user_id: string
          platform: string
          username: string
          profile_url: string
          connected: boolean
          last_synced: string | null
          access_token: string | null
          refresh_token: string | null
          followers: number | null
          posts: number | null
          engagement: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          username: string
          profile_url: string
          connected?: boolean
          last_synced?: string | null
          access_token?: string | null
          refresh_token?: string | null
          followers?: number | null
          posts?: number | null
          engagement?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          username?: string
          profile_url?: string
          connected?: boolean
          last_synced?: string | null
          access_token?: string | null
          refresh_token?: string | null
          followers?: number | null
          posts?: number | null
          engagement?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      brand_deals: {
        Row: {
          id: string
          brand_id: string
          brand_name: string
          brand_logo: string | null
          creator_id: string
          title: string
          description: string | null
          budget: number
          status: 'pending' | 'accepted' | 'rejected' | 'completed'
          requirements: string[] | null
          deliverables: string[] | null
          deadline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          brand_name: string
          brand_logo?: string | null
          creator_id: string
          title: string
          description?: string | null
          budget: number
          status?: 'pending' | 'accepted' | 'rejected' | 'completed'
          requirements?: string[] | null
          deliverables?: string[] | null
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          brand_name?: string
          brand_logo?: string | null
          creator_id?: string
          title?: string
          description?: string | null
          budget?: number
          status?: 'pending' | 'accepted' | 'rejected' | 'completed'
          requirements?: string[] | null
          deliverables?: string[] | null
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          partner_id: string
          partner_name: string
          partner_avatar: string | null
          partner_type: string
          last_message: string | null
          last_message_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          partner_id: string
          partner_name: string
          partner_avatar?: string | null
          partner_type: string
          last_message?: string | null
          last_message_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          partner_id?: string
          partner_name?: string
          partner_avatar?: string | null
          partner_type?: string
          last_message?: string | null
          last_message_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          sender: string
          content: string
          timestamp: string
          read: boolean
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          sender: string
          content: string
          timestamp?: string
          read?: boolean
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          sender?: string
          content?: string
          timestamp?: string
          read?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
