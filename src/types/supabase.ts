
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
      conversations: {
        Row: {
          id: string
          created_at: string
          partner_id: string
          partner_name: string
          partner_avatar: string
          partner_type: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          partner_id: string
          partner_name: string
          partner_avatar: string
          partner_type: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          partner_id?: string
          partner_name?: string
          partner_avatar?: string
          partner_type?: string
          user_id?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender: string
          content: string
          timestamp: string
          read: boolean
          user_id: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender: string
          content: string
          timestamp?: string
          read?: boolean
          user_id: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender?: string
          content?: string
          timestamp?: string
          read?: boolean
          user_id?: string
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
