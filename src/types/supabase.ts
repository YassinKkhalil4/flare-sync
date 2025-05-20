
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
          full_name: string | null
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          onboarded: boolean | null
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          onboarded?: boolean | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          onboarded?: boolean | null
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
          access_token_encrypted: string | null
          refresh_token_encrypted: string | null
          access_token_iv: string | null
          refresh_token_iv: string | null
          stats: Json | null
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
          access_token_encrypted?: string | null
          refresh_token_encrypted?: string | null
          access_token_iv?: string | null
          refresh_token_iv?: string | null
          stats?: Json | null
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
          access_token_encrypted?: string | null
          refresh_token_encrypted?: string | null
          access_token_iv?: string | null
          refresh_token_iv?: string | null
          stats?: Json | null
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
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'user' | 'creator' | 'brand' | 'admin'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'user' | 'creator' | 'brand' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'user' | 'creator' | 'brand' | 'admin'
          created_at?: string
        }
      }
      admin_permissions: {
        Row: {
          id: string
          admin_id: string
          permission: string
          created_at: string | null
        }
        Insert: {
          id?: string
          admin_id: string
          permission: string
          created_at?: string | null
        }
        Update: {
          id?: string
          admin_id?: string
          permission?: string
          created_at?: string | null
        }
      }
      admin_access_logs: {
        Row: {
          id: string
          admin_id: string
          action: 'view' | 'update' | 'delete'
          resource_type: string
          resource_id: string
          access_time: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: 'view' | 'update' | 'delete'
          resource_type: string
          resource_id: string
          access_time?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: 'view' | 'update' | 'delete'
          resource_type?: string
          resource_id?: string
          access_time?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          user_id: string;
          role: 'admin' | 'user' | 'creator' | 'brand';
        };
        Returns: boolean;
      }
    }
    Enums: {
      app_role: 'user' | 'creator' | 'brand' | 'admin'
      admin_action: 'view' | 'update' | 'delete'
    }
  }
}
