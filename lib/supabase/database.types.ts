// ============================================
// Supabase Database Types (Generated)
// ============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password: string;
          name: string;
          avatar: string | null;
          role: string;
          identity: string[];
          bio: string | null;
          created_at: string;
          wallet_balance: number;
          wallet_total_earned: number;
          wallet_total_spent: number;
          credit_score: number;
          credit_as_creator_rating: number;
          credit_as_creator_completed: number;
          credit_as_creator_review_count: number;
          credit_as_client_rating: number;
          credit_as_client_posted: number;
          credit_as_client_review_count: number;
        };
        Insert: {
          id?: string;
          email: string;
          password: string;
          name: string;
          avatar?: string | null;
          role?: string;
          identity?: string[];
          bio?: string | null;
          created_at?: string;
          wallet_balance?: number;
          wallet_total_earned?: number;
          wallet_total_spent?: number;
          credit_score?: number;
          credit_as_creator_rating?: number;
          credit_as_creator_completed?: number;
          credit_as_creator_review_count?: number;
          credit_as_client_rating?: number;
          credit_as_client_posted?: number;
          credit_as_client_review_count?: number;
        };
        Update: {
          id?: string;
          email?: string;
          password?: string;
          name?: string;
          avatar?: string | null;
          role?: string;
          identity?: string[];
          bio?: string | null;
          created_at?: string;
          wallet_balance?: number;
          wallet_total_earned?: number;
          wallet_total_spent?: number;
          credit_score?: number;
          credit_as_creator_rating?: number;
          credit_as_creator_completed?: number;
          credit_as_creator_review_count?: number;
          credit_as_client_rating?: number;
          credit_as_client_posted?: number;
          credit_as_client_review_count?: number;
        };
      };
      avatars: {
        Row: {
          id: string;
          creator_id: string;
          name: string;
          description: string;
          avatar_url: string | null;
          personality_mbti: string | null;
          personality_communication_style: string;
          personality_proactivity: number;
          personality_expertise: string[];
          memory_soul: string | null;
          memory_memory: string | null;
          memory_history: string[];
          memory_custom: string[];
          skills: string[];
          pricing_type: string;
          pricing_per_task_min: number | null;
          pricing_per_task_max: number | null;
          pricing_per_task_estimate: string | null;
          pricing_subscription_monthly: number | null;
          pricing_subscription_yearly: number | null;
          scope_can_do: string[];
          scope_cannot_do: string[];
          scope_response_time: string | null;
          status: string;
          stats_hired_count: number;
          stats_completed_tasks: number;
          stats_total_work_time: number;
          stats_rating: number;
          stats_review_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          name: string;
          description: string;
          avatar_url?: string | null;
          personality_mbti?: string | null;
          personality_communication_style?: string;
          personality_proactivity?: number;
          personality_expertise?: string[];
          memory_soul?: string | null;
          memory_memory?: string | null;
          memory_history?: string[];
          memory_custom?: string[];
          skills?: string[];
          pricing_type?: string;
          pricing_per_task_min?: number | null;
          pricing_per_task_max?: number | null;
          pricing_per_task_estimate?: string | null;
          pricing_subscription_monthly?: number | null;
          pricing_subscription_yearly?: number | null;
          scope_can_do?: string[];
          scope_cannot_do?: string[];
          scope_response_time?: string | null;
          status?: string;
          stats_hired_count?: number;
          stats_completed_tasks?: number;
          stats_total_work_time?: number;
          stats_rating?: number;
          stats_review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          name?: string;
          description?: string;
          avatar_url?: string | null;
          personality_mbti?: string | null;
          personality_communication_style?: string;
          personality_proactivity?: number;
          personality_expertise?: string[];
          memory_soul?: string | null;
          memory_memory?: string | null;
          memory_history?: string[];
          memory_custom?: string[];
          skills?: string[];
          pricing_type?: string;
          pricing_per_task_min?: number | null;
          pricing_per_task_max?: number | null;
          pricing_per_task_estimate?: string | null;
          pricing_subscription_monthly?: number | null;
          pricing_subscription_yearly?: number | null;
          scope_can_do?: string[];
          scope_cannot_do?: string[];
          scope_response_time?: string | null;
          status?: string;
          stats_hired_count?: number;
          stats_completed_tasks?: number;
          stats_total_work_time?: number;
          stats_rating?: number;
          stats_review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          avatar_id: string;
          creator_id: string;
          client_id: string;
          title: string;
          description: string;
          type: string;
          price: number;
          pricing_type: string;
          status: string;
          ai_status: string;
          ai_started_at: string | null;
          ai_completed_at: string | null;
          ai_deliverables: Json;
          human_status: string;
          human_assigned_to: string | null;
          human_started_at: string | null;
          human_completed_at: string | null;
          human_review_notes: string | null;
          human_revision_notes: string | null;
          final_status: string;
          final_delivered_at: string | null;
          final_accepted_at: string | null;
          final_client_notes: string | null;
          timeline_created_at: string;
          timeline_ai_completed_at: string | null;
          timeline_human_review_at: string | null;
          timeline_delivered_at: string | null;
          timeline_completed_at: string | null;
          payment_status: string;
          payment_platform_fee: number;
          payment_creator_earnings: number;
        };
        Insert: {
          id?: string;
          avatar_id: string;
          creator_id: string;
          client_id: string;
          title: string;
          description: string;
          type?: string;
          price: number;
          pricing_type?: string;
          status?: string;
          ai_status?: string;
          ai_started_at?: string | null;
          ai_completed_at?: string | null;
          ai_deliverables?: Json;
          human_status?: string;
          human_assigned_to?: string | null;
          human_started_at?: string | null;
          human_completed_at?: string | null;
          human_review_notes?: string | null;
          human_revision_notes?: string | null;
          final_status?: string;
          final_delivered_at?: string | null;
          final_accepted_at?: string | null;
          final_client_notes?: string | null;
          timeline_created_at?: string;
          timeline_ai_completed_at?: string | null;
          timeline_human_review_at?: string | null;
          timeline_delivered_at?: string | null;
          timeline_completed_at?: string | null;
          payment_status?: string;
          payment_platform_fee?: number;
          payment_creator_earnings?: number;
        };
        Update: {
          id?: string;
          avatar_id?: string;
          creator_id?: string;
          client_id?: string;
          title?: string;
          description?: string;
          type?: string;
          price?: number;
          pricing_type?: string;
          status?: string;
          ai_status?: string;
          ai_started_at?: string | null;
          ai_completed_at?: string | null;
          ai_deliverables?: Json;
          human_status?: string;
          human_assigned_to?: string | null;
          human_started_at?: string | null;
          human_completed_at?: string | null;
          human_review_notes?: string | null;
          human_revision_notes?: string | null;
          final_status?: string;
          final_delivered_at?: string | null;
          final_accepted_at?: string | null;
          final_client_notes?: string | null;
          timeline_created_at?: string;
          timeline_ai_completed_at?: string | null;
          timeline_human_review_at?: string | null;
          timeline_delivered_at?: string | null;
          timeline_completed_at?: string | null;
          payment_status?: string;
          payment_platform_fee?: number;
          payment_creator_earnings?: number;
        };
      };
      messages: {
        Row: {
          id: string;
          task_id: string;
          role: string;
          content: string;
          timestamp: string;
          attachments: Json;
        };
        Insert: {
          id?: string;
          task_id: string;
          role: string;
          content: string;
          timestamp?: string;
          attachments?: Json;
        };
        Update: {
          id?: string;
          task_id?: string;
          role?: string;
          content?: string;
          timestamp?: string;
          attachments?: Json;
        };
      };
      reviews: {
        Row: {
          id: string;
          task_id: string;
          reviewer_id: string;
          target_id: string;
          target_type: string;
          rating: number;
          content: string;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          reviewer_id: string;
          target_id: string;
          target_type: string;
          rating: number;
          content: string;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          reviewer_id?: string;
          target_id?: string;
          target_type?: string;
          rating?: number;
          content?: string;
          tags?: string[];
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          content: string;
          read: boolean;
          data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          content: string;
          read?: boolean;
          data?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          content?: string;
          read?: boolean;
          data?: Json;
          created_at?: string;
        };
      };
      creator_applications: {
        Row: {
          id: string;
          user_id: string;
          real_name: string;
          id_number: string | null;
          phone: string;
          email: string;
          profession: string;
          experience_years: number | null;
          bio: string;
          skills: string[];
          portfolio_urls: string[];
          status: string;
          review_notes: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          real_name: string;
          id_number?: string | null;
          phone: string;
          email: string;
          profession: string;
          experience_years?: number | null;
          bio: string;
          skills?: string[];
          portfolio_urls?: string[];
          status?: string;
          review_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          real_name?: string;
          id_number?: string | null;
          phone?: string;
          email?: string;
          profession?: string;
          experience_years?: number | null;
          bio?: string;
          skills?: string[];
          portfolio_urls?: string[];
          status?: string;
          review_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
