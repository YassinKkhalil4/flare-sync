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
          access_time: string | null
          action: string
          admin_id: string
          id: string
          resource_id: string
          resource_type: string
        }
        Insert: {
          access_time?: string | null
          action: string
          admin_id: string
          id?: string
          resource_id: string
          resource_type: string
        }
        Update: {
          access_time?: string | null
          action?: string
          admin_id?: string
          id?: string
          resource_id?: string
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_access_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "admin_permissions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_roles: {
        Row: {
          can_access_billing: boolean
          can_manage_content: boolean
          can_manage_plans: boolean
          can_manage_users: boolean
          created_at: string | null
          id: string
          tier: Database["public"]["Enums"]["admin_tier"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_access_billing?: boolean
          can_manage_content?: boolean
          can_manage_plans?: boolean
          can_manage_users?: boolean
          created_at?: string | null
          id?: string
          tier?: Database["public"]["Enums"]["admin_tier"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_access_billing?: boolean
          can_manage_content?: boolean
          can_manage_plans?: boolean
          can_manage_users?: boolean
          created_at?: string | null
          id?: string
          tier?: Database["public"]["Enums"]["admin_tier"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_captions: {
        Row: {
          captions: string[] | null
          created_at: string | null
          description: string | null
          id: string
          niche: string | null
          objective: string | null
          platform: string
          post_type: string | null
          selected_caption: string | null
          tone: string | null
          updated_at: string | null
          used_in_post_id: string | null
          user_id: string
        }
        Insert: {
          captions?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          niche?: string | null
          objective?: string | null
          platform: string
          post_type?: string | null
          selected_caption?: string | null
          tone?: string | null
          updated_at?: string | null
          used_in_post_id?: string | null
          user_id: string
        }
        Update: {
          captions?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          niche?: string | null
          objective?: string | null
          platform?: string
          post_type?: string | null
          selected_caption?: string | null
          tone?: string | null
          updated_at?: string | null
          used_in_post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_captions_used_in_post_id_fkey"
            columns: ["used_in_post_id"]
            isOneToOne: false
            referencedRelation: "content_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_captions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_conversations: {
        Row: {
          created_at: string | null
          id: string
          topic: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          topic?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          topic?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "assistant_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_deals: {
        Row: {
          brand_id: string
          brand_logo: string | null
          brand_name: string
          budget: number
          created_at: string | null
          creator_id: string
          deadline: string | null
          deliverables: string[] | null
          description: string | null
          id: string
          requirements: string[] | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          brand_logo?: string | null
          brand_name: string
          budget: number
          created_at?: string | null
          creator_id: string
          deadline?: string | null
          deliverables?: string[] | null
          description?: string | null
          id?: string
          requirements?: string[] | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          brand_logo?: string | null
          brand_name?: string
          budget?: number
          created_at?: string | null
          creator_id?: string
          deadline?: string | null
          deliverables?: string[] | null
          description?: string | null
          id?: string
          requirements?: string[] | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_deals_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_deals_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_approval_flows: {
        Row: {
          approver_ids: string[]
          created_at: string | null
          id: string
          name: string
          required_approvals: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approver_ids: string[]
          created_at?: string | null
          id?: string
          name: string
          required_approvals?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approver_ids?: string[]
          created_at?: string | null
          id?: string
          name?: string
          required_approvals?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_approval_flows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_approvals: {
        Row: {
          approver_id: string
          created_at: string | null
          feedback: string | null
          id: string
          post_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          approver_id: string
          created_at?: string | null
          feedback?: string | null
          id?: string
          post_id: string
          status: string
          updated_at?: string | null
        }
        Update: {
          approver_id?: string
          created_at?: string | null
          feedback?: string | null
          id?: string
          post_id?: string
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
      content_plan_posts: {
        Row: {
          content_type: string
          created_at: string
          day: string
          description: string
          hashtags: string[] | null
          id: string
          plan_id: string
          platform: string
          status: string
          suggested_caption: string | null
          time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_type: string
          created_at?: string
          day: string
          description: string
          hashtags?: string[] | null
          id?: string
          plan_id: string
          platform: string
          status?: string
          suggested_caption?: string | null
          time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_type?: string
          created_at?: string
          day?: string
          description?: string
          hashtags?: string[] | null
          id?: string
          plan_id?: string
          platform?: string
          status?: string
          suggested_caption?: string | null
          time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_plan_posts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "content_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      content_plans: {
        Row: {
          content: string
          created_at: string
          end_date: string
          goal: string
          id: string
          name: string
          platforms: string[]
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          end_date: string
          goal: string
          id?: string
          name: string
          platforms?: string[]
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          end_date?: string
          goal?: string
          id?: string
          name?: string
          platforms?: string[]
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          metrics: Json | null
          platform: string
          platform_post_id: string | null
          published_at: string | null
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
          metrics?: Json | null
          platform: string
          platform_post_id?: string | null
          published_at?: string | null
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
          metrics?: Json | null
          platform?: string
          platform_post_id?: string | null
          published_at?: string | null
          scheduled_for?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
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
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message: string | null
          last_message_time: string | null
          partner_avatar: string | null
          partner_id: string
          partner_name: string
          partner_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_time?: string | null
          partner_avatar?: string | null
          partner_id: string
          partner_name: string
          partner_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_time?: string | null
          partner_avatar?: string | null
          partner_id?: string
          partner_name?: string
          partner_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          brand_id: string
          created_at: string | null
          creator_id: string
          description: string
          id: string
          price: number
          status: string
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          creator_id: string
          description: string
          id?: string
          price: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          creator_id?: string
          description?: string
          id?: string
          price?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement_predictions: {
        Row: {
          confidence_score: number | null
          content: string | null
          created_at: string | null
          hashtags: string[] | null
          id: string
          media_urls: string[] | null
          metadata: Json | null
          platform: string
          post_time: string | null
          predicted_comments: number | null
          predicted_likes: number | null
          predicted_shares: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          content?: string | null
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          media_urls?: string[] | null
          metadata?: Json | null
          platform: string
          post_time?: string | null
          predicted_comments?: number | null
          predicted_likes?: number | null
          predicted_shares?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          content?: string | null
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          media_urls?: string[] | null
          metadata?: Json | null
          platform?: string
          post_time?: string | null
          predicted_comments?: number | null
          predicted_likes?: number | null
          predicted_shares?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "engagement_predictions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          due_date: string | null
          id: string
          invoice_number: string
          paid_date: string | null
          payment_id: string | null
          payment_method: string | null
          pdf_url: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          paid_date?: string | null
          payment_id?: string | null
          payment_method?: string | null
          pdf_url?: string | null
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          paid_date?: string | null
          payment_id?: string | null
          payment_method?: string | null
          pdf_url?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          id: string
          read: boolean | null
          sender: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          id?: string
          read?: boolean | null
          sender: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          id?: string
          read?: boolean | null
          sender?: string
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          approval_requests_enabled: boolean | null
          content_published_enabled: boolean | null
          created_at: string | null
          email_enabled: boolean | null
          id: string
          social_events_enabled: boolean | null
          system_alerts_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approval_requests_enabled?: boolean | null
          content_published_enabled?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          social_events_enabled?: boolean | null
          system_alerts_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approval_requests_enabled?: boolean | null
          content_published_enabled?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
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
          updated_at: string | null
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
          updated_at?: string | null
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
          updated_at?: string | null
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
      plan_features: {
        Row: {
          advanced_analytics: boolean
          api_access: boolean
          automated_scheduling: boolean
          content_generation: boolean
          created_at: string | null
          custom_branding: boolean
          id: string
          max_posts: number
          max_social_accounts: number
          max_users: number
          plan_id: string
          priority_support: boolean
          team_collaboration: boolean
          updated_at: string | null
        }
        Insert: {
          advanced_analytics?: boolean
          api_access?: boolean
          automated_scheduling?: boolean
          content_generation?: boolean
          created_at?: string | null
          custom_branding?: boolean
          id?: string
          max_posts?: number
          max_social_accounts?: number
          max_users?: number
          plan_id: string
          priority_support?: boolean
          team_collaboration?: boolean
          updated_at?: string | null
        }
        Update: {
          advanced_analytics?: boolean
          api_access?: boolean
          automated_scheduling?: boolean
          content_generation?: boolean
          created_at?: string | null
          custom_branding?: boolean
          id?: string
          max_posts?: number
          max_social_accounts?: number
          max_users?: number
          plan_id?: string
          priority_support?: boolean
          team_collaboration?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          current_period_end: string | null
          email: string
          full_name: string | null
          id: string
          onboarded: boolean | null
          plan: string | null
          role: string | null
          stripe_customer_id: string | null
          subscription_id: string | null
          subscription_status: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          current_period_end?: string | null
          email: string
          full_name?: string | null
          id: string
          onboarded?: boolean | null
          plan?: string | null
          role?: string | null
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          current_period_end?: string | null
          email?: string
          full_name?: string | null
          id?: string
          onboarded?: boolean | null
          plan?: string | null
          role?: string | null
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      scheduled_posts: {
        Row: {
          content: string | null
          created_at: string | null
          error_message: string | null
          id: string
          media_urls: string[] | null
          metadata: Json | null
          platform: string
          post_id: string | null
          scheduled_for: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          media_urls?: string[] | null
          metadata?: Json | null
          platform: string
          post_id?: string | null
          scheduled_for: string
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          media_urls?: string[] | null
          metadata?: Json | null
          platform?: string
          post_id?: string | null
          scheduled_for?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
        Relationships: [
          {
            foreignKeyName: "social_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          description: string | null
          id: string
          metadata: Json | null
          payment_id: string | null
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
          metadata?: Json | null
          payment_id?: string | null
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
          metadata?: Json | null
          payment_id?: string | null
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
      user_api_keys: {
        Row: {
          created_at: string | null
          id: string
          key_name: string
          key_value: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key_name: string
          key_value: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key_name?: string
          key_value?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_plan_limit: {
        Args: { resource_name: string }
        Returns: number
      }
      has_role: {
        Args: { required_role: string }
        Returns: boolean
      }
      user_has_feature_access: {
        Args: { feature_name: string }
        Returns: boolean
      }
    }
    Enums: {
      admin_tier: "owner" | "manager" | "support" | "standard"
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
      admin_tier: ["owner", "manager", "support", "standard"],
    },
  },
} as const
