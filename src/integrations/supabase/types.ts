export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      calendar_items: {
        Row: {
          coach_id: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          item_type: string
          metadata: Json | null
          player_id: string | null
          scheduled_date: string
          scheduled_time: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          coach_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          item_type: string
          metadata?: Json | null
          player_id?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          coach_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          item_type?: string
          metadata?: Json | null
          player_id?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      coach_message_preferences: {
        Row: {
          created_at: string | null
          muted_until: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          muted_until?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          muted_until?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      coach_messages: {
        Row: {
          created_at: string | null
          cta_action: string | null
          cta_text: string | null
          id: string
          is_read: boolean | null
          message_content: string
          message_type: string
          player_id: string | null
          read_at: string | null
          trigger_reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          cta_action?: string | null
          cta_text?: string | null
          id?: string
          is_read?: boolean | null
          message_content: string
          message_type: string
          player_id?: string | null
          read_at?: string | null
          trigger_reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          cta_action?: string | null
          cta_text?: string | null
          id?: string
          is_read?: boolean | null
          message_content?: string
          message_type?: string
          player_id?: string | null
          read_at?: string | null
          trigger_reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_messages_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      content_library: {
        Row: {
          category: string | null
          content_type: string
          created_at: string
          created_by: string
          description: string | null
          document_url: string | null
          id: string
          is_active: boolean | null
          tags: string[] | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category?: string | null
          content_type: string
          created_at?: string
          created_by: string
          description?: string | null
          document_url?: string | null
          id?: string
          is_active?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string | null
          content_type?: string
          created_at?: string
          created_by?: string
          description?: string | null
          document_url?: string | null
          id?: string
          is_active?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      drill_feedback_notes: {
        Row: {
          analysis_id: string
          conversation: Json
          created_at: string
          id: string
          summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_id: string
          conversation?: Json
          created_at?: string
          id?: string
          summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_id?: string
          conversation?: Json
          created_at?: string
          id?: string
          summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drill_feedback_notes_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "swing_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      drills: {
        Row: {
          created_at: string
          description: string
          difficulty: number
          duration: number
          equipment_needed: string[] | null
          id: string
          instructions: string | null
          instructions_video_url: string | null
          name: string
          pillar: string
          skill_level: string | null
          target_area: string | null
          thumbnail_url: string | null
          updated_at: string
          video_type: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description: string
          difficulty: number
          duration: number
          equipment_needed?: string[] | null
          id?: string
          instructions?: string | null
          instructions_video_url?: string | null
          name: string
          pillar: string
          skill_level?: string | null
          target_area?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          video_type?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          difficulty?: number
          duration?: number
          equipment_needed?: string[] | null
          id?: string
          instructions?: string | null
          instructions_video_url?: string | null
          name?: string
          pillar?: string
          skill_level?: string | null
          target_area?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          video_type?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      external_session_data: {
        Row: {
          created_at: string | null
          data_source: string
          extracted_metrics: Json
          id: string
          notes: string | null
          player_id: string
          screenshot_url: string | null
          session_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_source: string
          extracted_metrics: Json
          id?: string
          notes?: string | null
          player_id: string
          screenshot_url?: string | null
          session_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_source?: string
          extracted_metrics?: Json
          id?: string
          notes?: string | null
          player_id?: string
          screenshot_url?: string | null
          session_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_session_data_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      grit_scores: {
        Row: {
          created_at: string | null
          current_score: number | null
          current_streak: number | null
          id: string
          last_completion_date: string | null
          longest_streak: number | null
          player_id: string | null
          streak_updated_at: string | null
          total_tasks_assigned: number | null
          total_tasks_completed: number | null
          total_tasks_on_time: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_score?: number | null
          current_streak?: number | null
          id?: string
          last_completion_date?: string | null
          longest_streak?: number | null
          player_id?: string | null
          streak_updated_at?: string | null
          total_tasks_assigned?: number | null
          total_tasks_completed?: number | null
          total_tasks_on_time?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_score?: number | null
          current_streak?: number | null
          id?: string
          last_completion_date?: string | null
          longest_streak?: number | null
          player_id?: string | null
          streak_updated_at?: string | null
          total_tasks_assigned?: number | null
          total_tasks_completed?: number | null
          total_tasks_on_time?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grit_scores_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      live_coaching_sessions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          live_link: string | null
          replay_notes: string | null
          replay_url: string | null
          session_date: string
          session_time: string
          status: string
          submission_deadline: string | null
          timezone: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          live_link?: string | null
          replay_notes?: string | null
          replay_url?: string | null
          session_date: string
          session_time?: string
          status?: string
          submission_deadline?: string | null
          timezone?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          live_link?: string | null
          replay_notes?: string | null
          replay_url?: string | null
          session_date?: string
          session_time?: string
          status?: string
          submission_deadline?: string | null
          timezone?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      membership_features: {
        Row: {
          created_at: string
          feature_key: string
          feature_value: Json
          id: string
          tier: Database["public"]["Enums"]["membership_tier"]
        }
        Insert: {
          created_at?: string
          feature_key: string
          feature_value: Json
          id?: string
          tier: Database["public"]["Enums"]["membership_tier"]
        }
        Update: {
          created_at?: string
          feature_key?: string
          feature_value?: Json
          id?: string
          tier?: Database["public"]["Enums"]["membership_tier"]
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          player_id: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          player_id?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          player_id?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          first_name: string
          handedness: string | null
          height: number | null
          height_weight_updated_at: string | null
          id: string
          is_active: boolean | null
          is_model: boolean | null
          jersey_number: string | null
          last_name: string
          notes: string | null
          organization: string | null
          position: string | null
          team_name: string | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          first_name?: string
          handedness?: string | null
          height?: number | null
          height_weight_updated_at?: string | null
          id?: string
          is_active?: boolean | null
          is_model?: boolean | null
          jersey_number?: string | null
          last_name?: string
          notes?: string | null
          organization?: string | null
          position?: string | null
          team_name?: string | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          first_name?: string
          handedness?: string | null
          height?: number | null
          height_weight_updated_at?: string | null
          id?: string
          is_active?: boolean | null
          is_model?: boolean | null
          jersey_number?: string | null
          last_name?: string
          notes?: string | null
          organization?: string | null
          position?: string | null
          team_name?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          session_avg: number | null
          started_at: string
          total_swings: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          session_avg?: number | null
          started_at?: string
          total_swings?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          session_avg?: number | null
          started_at?: string
          total_swings?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          biggest_challenge: string | null
          created_at: string | null
          current_level: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          motivation: string | null
          onboarding_completed: boolean | null
          phone: string | null
          primary_goal: string | null
          referral_source: string | null
          updated_at: string | null
          years_playing: number | null
        }
        Insert: {
          biggest_challenge?: string | null
          created_at?: string | null
          current_level?: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          motivation?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          primary_goal?: string | null
          referral_source?: string | null
          updated_at?: string | null
          years_playing?: number | null
        }
        Update: {
          biggest_challenge?: string | null
          created_at?: string | null
          current_level?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          motivation?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          primary_goal?: string | null
          referral_source?: string | null
          updated_at?: string | null
          years_playing?: number | null
        }
        Relationships: []
      }
      program_checkins: {
        Row: {
          checkin_date: string
          created_at: string
          drills_completed: string[] | null
          id: string
          notes: string | null
          program_id: string
          user_id: string
        }
        Insert: {
          checkin_date?: string
          created_at?: string
          drills_completed?: string[] | null
          id?: string
          notes?: string | null
          program_id: string
          user_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string
          drills_completed?: string[] | null
          id?: string
          notes?: string | null
          program_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_checkins_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          coach_id: string
          code: string
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          seats_allocated: number
          seats_used: number
          updated_at: string
        }
        Insert: {
          coach_id: string
          code: string
          created_at?: string
          expires_at: string
          id?: string
          is_active?: boolean
          seats_allocated?: number
          seats_used?: number
          updated_at?: string
        }
        Update: {
          coach_id?: string
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          seats_allocated?: number
          seats_used?: number
          updated_at?: string
        }
        Relationships: []
      }
      promo_redemptions: {
        Row: {
          athlete_id: string
          id: string
          promo_code_id: string
          redeemed_at: string
        }
        Insert: {
          athlete_id: string
          id?: string
          promo_code_id: string
          redeemed_at?: string
        }
        Update: {
          athlete_id?: string
          id?: string
          promo_code_id?: string
          redeemed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_redemptions_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_tasks: {
        Row: {
          created_at: string | null
          description: string | null
          due_day_of_week: number | null
          due_time: string | null
          id: string
          is_active: boolean | null
          program_tier: Database["public"]["Enums"]["membership_tier"]
          recurrence: string
          task_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_day_of_week?: number | null
          due_time?: string | null
          id?: string
          is_active?: boolean | null
          program_tier: Database["public"]["Enums"]["membership_tier"]
          recurrence: string
          task_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_day_of_week?: number | null
          due_time?: string | null
          id?: string
          is_active?: boolean | null
          program_tier?: Database["public"]["Enums"]["membership_tier"]
          recurrence?: string
          task_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      session_submissions: {
        Row: {
          analysis_id: string | null
          feel_notes: string | null
          id: string
          is_on_time: boolean | null
          player_id: string | null
          session_id: string
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          analysis_id?: string | null
          feel_notes?: string | null
          id?: string
          is_on_time?: boolean | null
          player_id?: string | null
          session_id: string
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          analysis_id?: string | null
          feel_notes?: string | null
          id?: string
          is_on_time?: boolean | null
          player_id?: string | null
          session_id?: string
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_submissions_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "swing_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_submissions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_submissions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_coaching_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      swing_analyses: {
        Row: {
          anchor_score: number
          created_at: string
          drill_effectiveness_score: number | null
          drill_feedback: Json | null
          engine_score: number
          id: string
          metrics: Json
          overall_score: number
          player_id: string | null
          session_id: string | null
          user_id: string | null
          video_type: string
          video_url: string | null
          whip_score: number
        }
        Insert: {
          anchor_score: number
          created_at?: string
          drill_effectiveness_score?: number | null
          drill_feedback?: Json | null
          engine_score: number
          id?: string
          metrics: Json
          overall_score: number
          player_id?: string | null
          session_id?: string | null
          user_id?: string | null
          video_type?: string
          video_url?: string | null
          whip_score: number
        }
        Update: {
          anchor_score?: number
          created_at?: string
          drill_effectiveness_score?: number | null
          drill_feedback?: Json | null
          engine_score?: number
          id?: string
          metrics?: Json
          overall_score?: number
          player_id?: string | null
          session_id?: string | null
          user_id?: string | null
          video_type?: string
          video_url?: string | null
          whip_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "swing_analyses_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swing_analyses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "practice_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_recording_sessions: {
        Row: {
          client_device_id: string | null
          client_video_url: string | null
          created_at: string | null
          id: string
          master_device_id: string
          master_video_url: string | null
          session_code: string
          started_at: string | null
          status: string
          stopped_at: string | null
        }
        Insert: {
          client_device_id?: string | null
          client_video_url?: string | null
          created_at?: string | null
          id?: string
          master_device_id: string
          master_video_url?: string | null
          session_code: string
          started_at?: string | null
          status?: string
          stopped_at?: string | null
        }
        Update: {
          client_device_id?: string | null
          client_video_url?: string | null
          created_at?: string | null
          id?: string
          master_device_id?: string
          master_video_url?: string | null
          session_code?: string
          started_at?: string | null
          status?: string
          stopped_at?: string | null
        }
        Relationships: []
      }
      task_completions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          notes: string | null
          player_id: string | null
          scheduled_date: string
          status: string
          submission_data: Json | null
          task_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          player_id?: string | null
          scheduled_date: string
          status?: string
          submission_data?: Json | null
          task_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          player_id?: string | null
          scheduled_date?: string
          status?: string
          submission_data?: Json | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_completions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "scheduled_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      team_rosters: {
        Row: {
          assigned_at: string | null
          athlete_id: string
          coach_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          seats_purchased: number | null
          team_name: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          athlete_id: string
          coach_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          seats_purchased?: number | null
          team_name?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          athlete_id?: string
          coach_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          seats_purchased?: number | null
          team_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      training_programs: {
        Row: {
          analysis_id: string
          created_at: string
          end_date: string
          focus_pillar: string
          id: string
          is_active: boolean
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_id: string
          created_at?: string
          end_date?: string
          focus_pillar: string
          id?: string
          is_active?: boolean
          start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_id?: string
          created_at?: string
          end_date?: string
          focus_pillar?: string
          id?: string
          is_active?: boolean
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_programs_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "swing_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_tracking: {
        Row: {
          created_at: string | null
          last_login: string | null
          last_swing_upload: string | null
          last_task_completion: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          last_login?: string | null
          last_swing_upload?: string | null
          last_task_completion?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          last_login?: string | null
          last_swing_upload?: string | null
          last_task_completion?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_gamification: {
        Row: {
          badges: Json | null
          created_at: string
          current_streak: number
          id: string
          last_checkin_date: string | null
          longest_streak: number
          total_checkins: number
          updated_at: string
          user_id: string
        }
        Insert: {
          badges?: Json | null
          created_at?: string
          current_streak?: number
          id?: string
          last_checkin_date?: string | null
          longest_streak?: number
          total_checkins?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          badges?: Json | null
          created_at?: string
          current_streak?: number
          id?: string
          last_checkin_date?: string | null
          longest_streak?: number
          total_checkins?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_memberships: {
        Row: {
          cancelled_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          started_at: string
          status: string
          swing_count: number | null
          tier: Database["public"]["Enums"]["membership_tier"]
          updated_at: string
          user_id: string
          whop_membership_id: string | null
          whop_user_id: string | null
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          started_at?: string
          status?: string
          swing_count?: number | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
          user_id: string
          whop_membership_id?: string | null
          whop_user_id?: string | null
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          started_at?: string
          status?: string
          swing_count?: number | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
          user_id?: string
          whop_membership_id?: string | null
          whop_user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whop_webhook_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json
          processed: boolean
          processed_at: string | null
          whop_membership_id: string | null
          whop_user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload: Json
          processed?: boolean
          processed_at?: string | null
          whop_membership_id?: string | null
          whop_user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          whop_membership_id?: string | null
          whop_user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_analyze_swing: { Args: { _user_id: string }; Returns: boolean }
      get_user_membership_tier: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["membership_tier"]
      }
      has_membership_tier: {
        Args: {
          _tier: Database["public"]["Enums"]["membership_tier"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_swing_count: { Args: { _user_id: string }; Returns: number }
      update_grit_score: {
        Args: { _player_id?: string; _user_id: string }
        Returns: undefined
      }
      update_streak: {
        Args: {
          _completed_on_time?: boolean
          _player_id?: string
          _user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "coach" | "athlete" | "admin"
      membership_tier: "free" | "challenge" | "diy" | "elite"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["coach", "athlete", "admin"],
      membership_tier: ["free", "challenge", "diy", "elite"],
    },
  },
} as const
