export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_access_logs: {
        Row: {
          access_time: string
          action: Database["public"]["Enums"]["admin_action"]
          admin_id: string
          id: string
          resource_id: string
          resource_type: string
        }
        Insert: {
          access_time?: string
          action: Database["public"]["Enums"]["admin_action"]
          admin_id: string
          id?: string
          resource_id: string
          resource_type: string
        }
        Update: {
          access_time?: string
          action?: Database["public"]["Enums"]["admin_action"]
          admin_id?: string
          id?: string
          resource_id?: string
          resource_type?: string
        }
        Relationships: []
      }
      admin_permissions: {
        Row: {
          admin_id: string
          created_at: string | null
          id: string
          permission: string
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          id?: string
          permission: string
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          id?: string
          permission?: string
        }
        Relationships: []
      }
      ai_captions: {
        Row: {
          captions: Json
          created_at: string
          description: string
          id: string
          niche: string
          objective: string
          platform: string
          post_type: string
          selected_caption: string | null
          tone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          captions: Json
          created_at?: string
          description: string
          id?: string
          niche: string
          objective: string
          platform: string
          post_type: string
          selected_caption?: string | null
          tone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          captions?: Json
          created_at?: string
          description?: string
          id?: string
          niche?: string
          objective?: string
          platform?: string
          post_type?: string
          selected_caption?: string | null
          tone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_approval_flows: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          required_approvers: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          required_approvers?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          required_approvers?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      content_approvals: {
        Row: {
          approver_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          post_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          approver_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          post_id?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          approver_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          post_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_approvals_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_approvals_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "content_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      content_post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "content_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "content_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      content_posts: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          media_urls: string[] | null
          platform: string
          platform_post_id: string | null
          reviewer_id: string | null
          reviewer_notes: string | null
          scheduled_for: string | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          media_urls?: string[] | null
          platform: string
          platform_post_id?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          scheduled_for?: string | null
          status: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          media_urls?: string[] | null
          platform?: string
          platform_post_id?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          scheduled_for?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_posts_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          brand_id: string
          created_at: string | null
          creator_id: string
          description: string | null
          id: string
          price: number
          status: string
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          creator_id: string
          description?: string | null
          id?: string
          price: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          creator_id?: string
          description?: string | null
          id?: string
          price?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      engagement_predictions: {
        Row: {
          caption: string
          created_at: string
          id: string
          insights: string[]
          media_metadata: Json | null
          metrics: Json
          overall_score: number
          platform: string
          post_type: string
          recommended_times: string[] | null
          scheduled_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          caption: string
          created_at?: string
          id?: string
          insights: string[]
          media_metadata?: Json | null
          metrics: Json
          overall_score: number
          platform: string
          post_type: string
          recommended_times?: string[] | null
          scheduled_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: string
          created_at?: string
          id?: string
          insights?: string[]
          media_metadata?: Json | null
          metrics?: Json
          overall_score?: number
          platform?: string
          post_type?: string
          recommended_times?: string[] | null
          scheduled_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string | null
          id: string
          invoice_number: string
          items: Json | null
          pdf_url: string | null
          status: string
          transaction_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          items?: Json | null
          pdf_url?: string | null
          status: string
          transaction_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          items?: Json | null
          pdf_url?: string | null
          status?: string
          transaction_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          approval_requests_enabled: boolean | null
          content_published_enabled: boolean | null
          email_enabled: boolean | null
          push_enabled: boolean | null
          social_events_enabled: boolean | null
          system_alerts_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approval_requests_enabled?: boolean | null
          content_published_enabled?: boolean | null
          email_enabled?: boolean | null
          push_enabled?: boolean | null
          social_events_enabled?: boolean | null
          system_alerts_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approval_requests_enabled?: boolean | null
          content_published_enabled?: boolean | null
          email_enabled?: boolean | null
          push_enabled?: boolean | null
          social_events_enabled?: boolean | null
          system_alerts_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          is_read: boolean | null
          message: string
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          message: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          message?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_analytics: {
        Row: {
          comments: number | null
          created_at: string
          engagement_rate: number | null
          id: string
          impressions: number | null
          likes: number | null
          post_id: string | null
          reach: number | null
          shares: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comments?: number | null
          created_at?: string
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          post_id?: string | null
          reach?: number | null
          shares?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comments?: number | null
          created_at?: string
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          post_id?: string | null
          reach?: number | null
          shares?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_analytics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "content_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      scheduled_posts: {
        Row: {
          content: string
          created_at: string | null
          error_message: string | null
          id: string
          media_urls: string[] | null
          metadata: Json | null
          platform: string
          platform_post_id: string | null
          post_id: string | null
          published_at: string | null
          scheduled_for: string
          social_profile_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          media_urls?: string[] | null
          metadata?: Json | null
          platform: string
          platform_post_id?: string | null
          post_id?: string | null
          published_at?: string | null
          scheduled_for: string
          social_profile_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          media_urls?: string[] | null
          metadata?: Json | null
          platform?: string
          platform_post_id?: string | null
          post_id?: string | null
          published_at?: string | null
          scheduled_for?: string
          social_profile_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "content_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_posts_social_profile_id_fkey"
            columns: ["social_profile_id"]
            isOneToOne: false
            referencedRelation: "social_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_profiles: {
        Row: {
          access_token: string | null
          access_token_encrypted: string | null
          access_token_iv: string | null
          connected: boolean | null
          created_at: string | null
          engagement: number | null
          followers: number | null
          id: string
          last_synced: string | null
          platform: string
          posts: number | null
          profile_url: string | null
          refresh_token: string | null
          refresh_token_encrypted: string | null
          refresh_token_iv: string | null
          stats: Json | null
          updated_at: string | null
          user_id: string
          username: string
        }
        Insert: {
          access_token?: string | null
          access_token_encrypted?: string | null
          access_token_iv?: string | null
          connected?: boolean | null
          created_at?: string | null
          engagement?: number | null
          followers?: number | null
          id?: string
          last_synced?: string | null
          platform: string
          posts?: number | null
          profile_url?: string | null
          refresh_token?: string | null
          refresh_token_encrypted?: string | null
          refresh_token_iv?: string | null
          stats?: Json | null
          updated_at?: string | null
          user_id: string
          username: string
        }
        Update: {
          access_token?: string | null
          access_token_encrypted?: string | null
          access_token_iv?: string | null
          connected?: boolean | null
          created_at?: string | null
          engagement?: number | null
          followers?: number | null
          id?: string
          last_synced?: string | null
          platform?: string
          posts?: number | null
          profile_url?: string | null
          refresh_token?: string | null
          refresh_token_encrypted?: string | null
          refresh_token_iv?: string | null
          stats?: Json | null
          updated_at?: string | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          id: string
          plan: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          description: string | null
          id: string
          payment_intent_id: string | null
          payment_method: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_method?: string | null
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_method?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args:
          | { role_name: string }
          | { user_id: string; role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
    }
    Enums: {
      admin_action: "view" | "update" | "delete"
      app_role: "admin" | "user" | "creator" | "brand"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_action: ["view", "update", "delete"],
      app_role: ["admin", "user", "creator", "brand"],
    },
  },
} as const
