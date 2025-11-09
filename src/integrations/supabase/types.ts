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
      admin_settings: {
        Row: {
          created_at: string | null
          email_notifications: Json | null
          id: string
          organization_logo_url: string | null
          organization_name: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: Json | null
          id?: string
          organization_logo_url?: string | null
          organization_name?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: Json | null
          id?: string
          organization_logo_url?: string | null
          organization_name?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      athlete_goals: {
        Row: {
          achievable_reasoning: string | null
          ai_generated: boolean | null
          baseline_analysis_id: string | null
          celebration_shown: boolean | null
          completed_at: string | null
          created_at: string | null
          current_value: number
          description: string | null
          goal_type: string
          id: string
          measurable_criteria: string | null
          milestone_checkpoints: Json | null
          player_id: string | null
          priority: string | null
          progress_history: Json | null
          relevant_context: string | null
          specific_details: string | null
          status: string
          target_metric: string
          target_value: number
          time_bound_deadline: string | null
          title: string
          unit: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievable_reasoning?: string | null
          ai_generated?: boolean | null
          baseline_analysis_id?: string | null
          celebration_shown?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_value: number
          description?: string | null
          goal_type: string
          id?: string
          measurable_criteria?: string | null
          milestone_checkpoints?: Json | null
          player_id?: string | null
          priority?: string | null
          progress_history?: Json | null
          relevant_context?: string | null
          specific_details?: string | null
          status?: string
          target_metric: string
          target_value: number
          time_bound_deadline?: string | null
          title: string
          unit?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievable_reasoning?: string | null
          ai_generated?: boolean | null
          baseline_analysis_id?: string | null
          celebration_shown?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_value?: number
          description?: string | null
          goal_type?: string
          id?: string
          measurable_criteria?: string | null
          milestone_checkpoints?: Json | null
          player_id?: string | null
          priority?: string | null
          progress_history?: Json | null
          relevant_context?: string | null
          specific_details?: string | null
          status?: string
          target_metric?: string
          target_value?: number
          time_bound_deadline?: string | null
          title?: string
          unit?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_goals_baseline_analysis_id_fkey"
            columns: ["baseline_analysis_id"]
            isOneToOne: false
            referencedRelation: "swing_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      ball_metrics: {
        Row: {
          analysis_id: string | null
          created_at: string
          exit_velocity: number
          exit_velocity_grade: number | null
          fly_ball_percentage: number | null
          ground_ball_percentage: number | null
          hard_hit_count: number | null
          hard_hit_grade: number | null
          hard_hit_percentage: number | null
          id: string
          launch_angle_grade: number | null
          level: string | null
          line_drive_percentage: number | null
          player_id: string | null
          total_swings: number | null
          user_id: string
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string
          exit_velocity: number
          exit_velocity_grade?: number | null
          fly_ball_percentage?: number | null
          ground_ball_percentage?: number | null
          hard_hit_count?: number | null
          hard_hit_grade?: number | null
          hard_hit_percentage?: number | null
          id?: string
          launch_angle_grade?: number | null
          level?: string | null
          line_drive_percentage?: number | null
          player_id?: string | null
          total_swings?: number | null
          user_id: string
        }
        Update: {
          analysis_id?: string | null
          created_at?: string
          exit_velocity?: number
          exit_velocity_grade?: number | null
          fly_ball_percentage?: number | null
          ground_ball_percentage?: number | null
          hard_hit_count?: number | null
          hard_hit_grade?: number | null
          hard_hit_percentage?: number | null
          id?: string
          launch_angle_grade?: number | null
          level?: string | null
          line_drive_percentage?: number | null
          player_id?: string | null
          total_swings?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ball_metrics_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "swing_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      bat_metrics: {
        Row: {
          analysis_id: string | null
          attack_angle: number
          attack_angle_grade: number | null
          bat_speed: number
          bat_speed_grade: number | null
          created_at: string
          id: string
          level: string | null
          personal_best: number | null
          player_id: string | null
          time_in_zone: number
          time_in_zone_grade: number | null
          user_id: string
        }
        Insert: {
          analysis_id?: string | null
          attack_angle: number
          attack_angle_grade?: number | null
          bat_speed: number
          bat_speed_grade?: number | null
          created_at?: string
          id?: string
          level?: string | null
          personal_best?: number | null
          player_id?: string | null
          time_in_zone: number
          time_in_zone_grade?: number | null
          user_id: string
        }
        Update: {
          analysis_id?: string | null
          attack_angle?: number
          attack_angle_grade?: number | null
          bat_speed?: number
          bat_speed_grade?: number | null
          created_at?: string
          id?: string
          level?: string | null
          personal_best?: number | null
          player_id?: string | null
          time_in_zone?: number
          time_in_zone_grade?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bat_metrics_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "swing_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      body_metrics: {
        Row: {
          analysis_id: string | null
          arms_peak_velocity: number
          arms_power: number
          bat_peak_velocity: number
          core_peak_velocity: number
          core_power: number
          created_at: string
          id: string
          is_correct_sequence: boolean | null
          launch_time: number
          legs_peak_velocity: number
          legs_power: number
          load_time: number
          player_id: string | null
          power_grade: number | null
          sequence_efficiency: number
          sequence_grade: number | null
          tempo_grade: number | null
          tempo_ratio: number
          user_id: string
        }
        Insert: {
          analysis_id?: string | null
          arms_peak_velocity: number
          arms_power: number
          bat_peak_velocity: number
          core_peak_velocity: number
          core_power: number
          created_at?: string
          id?: string
          is_correct_sequence?: boolean | null
          launch_time: number
          legs_peak_velocity: number
          legs_power: number
          load_time: number
          player_id?: string | null
          power_grade?: number | null
          sequence_efficiency: number
          sequence_grade?: number | null
          tempo_grade?: number | null
          tempo_ratio: number
          user_id: string
        }
        Update: {
          analysis_id?: string | null
          arms_peak_velocity?: number
          arms_power?: number
          bat_peak_velocity?: number
          core_peak_velocity?: number
          core_power?: number
          created_at?: string
          id?: string
          is_correct_sequence?: boolean | null
          launch_time?: number
          legs_peak_velocity?: number
          legs_power?: number
          load_time?: number
          player_id?: string | null
          power_grade?: number | null
          sequence_efficiency?: number
          sequence_grade?: number | null
          tempo_grade?: number | null
          tempo_ratio?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "body_metrics_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "swing_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_metrics: {
        Row: {
          analysis_id: string | null
          chase_rate: number | null
          consistency_rating: number | null
          created_at: string
          focus_grade: number | null
          focus_score: number | null
          good_swings_percentage: number | null
          good_takes_percentage: number | null
          id: string
          player_id: string | null
          reaction_time: number
          reaction_time_grade: number | null
          swing_decision_grade: number | null
          total_pitches: number | null
          user_id: string
        }
        Insert: {
          analysis_id?: string | null
          chase_rate?: number | null
          consistency_rating?: number | null
          created_at?: string
          focus_grade?: number | null
          focus_score?: number | null
          good_swings_percentage?: number | null
          good_takes_percentage?: number | null
          id?: string
          player_id?: string | null
          reaction_time: number
          reaction_time_grade?: number | null
          swing_decision_grade?: number | null
          total_pitches?: number | null
          user_id: string
        }
        Update: {
          analysis_id?: string | null
          chase_rate?: number | null
          consistency_rating?: number | null
          created_at?: string
          focus_grade?: number | null
          focus_score?: number | null
          good_swings_percentage?: number | null
          good_takes_percentage?: number | null
          id?: string
          player_id?: string | null
          reaction_time?: number
          reaction_time_grade?: number | null
          swing_decision_grade?: number | null
          total_pitches?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_metrics_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "swing_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
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
          reminder_sent: boolean | null
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
          reminder_sent?: boolean | null
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
          reminder_sent?: boolean | null
          scheduled_date?: string
          scheduled_time?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      challenge_participants: {
        Row: {
          baseline_score: number | null
          challenge_id: string
          current_rank: number | null
          current_score: number | null
          id: string
          joined_at: string
          last_activity: string | null
          player_id: string | null
          swings_completed: number | null
          team_name: string | null
          user_id: string
        }
        Insert: {
          baseline_score?: number | null
          challenge_id: string
          current_rank?: number | null
          current_score?: number | null
          id?: string
          joined_at?: string
          last_activity?: string | null
          player_id?: string | null
          swings_completed?: number | null
          team_name?: string | null
          user_id: string
        }
        Update: {
          baseline_score?: number | null
          challenge_id?: string
          current_rank?: number | null
          current_score?: number | null
          id?: string
          joined_at?: string
          last_activity?: string | null
          player_id?: string | null
          swings_completed?: number | null
          team_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "team_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_participants_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
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
      coaching_notes: {
        Row: {
          analysis_id: string | null
          athlete_id: string
          coach_id: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
          note_content: string
          note_type: string
          player_id: string | null
          updated_at: string | null
        }
        Insert: {
          analysis_id?: string | null
          athlete_id: string
          coach_id: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          note_content: string
          note_type?: string
          player_id?: string | null
          updated_at?: string | null
        }
        Update: {
          analysis_id?: string | null
          athlete_id?: string
          coach_id?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          note_content?: string
          note_type?: string
          player_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coaching_notes_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "swing_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaching_notes_player_id_fkey"
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
      drill_recommendations: {
        Row: {
          ai_generated: boolean | null
          analysis_id: string | null
          created_at: string | null
          focus_areas: string[] | null
          id: string
          player_id: string | null
          recommendations: Json
          training_plan_summary: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          analysis_id?: string | null
          created_at?: string | null
          focus_areas?: string[] | null
          id?: string
          player_id?: string | null
          recommendations: Json
          training_plan_summary?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          analysis_id?: string | null
          created_at?: string | null
          focus_areas?: string[] | null
          id?: string
          player_id?: string | null
          recommendations?: Json
          training_plan_summary?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drill_recommendations_analysis_id_fkey"
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
      generated_reports: {
        Row: {
          created_at: string | null
          id: string
          metrics: Json | null
          period_end: string
          period_start: string
          player_id: string | null
          report_type: string
          report_url: string
          schedule_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metrics?: Json | null
          period_end: string
          period_start: string
          player_id?: string | null
          report_type: string
          report_url: string
          schedule_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metrics?: Json | null
          period_end?: string
          period_start?: string
          player_id?: string | null
          report_type?: string
          report_url?: string
          schedule_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_reports_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_reports_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "report_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_progress_entries: {
        Row: {
          analysis_id: string | null
          created_at: string | null
          goal_id: string
          id: string
          is_milestone: boolean | null
          notes: string | null
          progress_percentage: number
          recorded_value: number
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string | null
          goal_id: string
          id?: string
          is_milestone?: boolean | null
          notes?: string | null
          progress_percentage: number
          recorded_value: number
        }
        Update: {
          analysis_id?: string | null
          created_at?: string | null
          goal_id?: string
          id?: string
          is_milestone?: boolean | null
          notes?: string | null
          progress_percentage?: number
          recorded_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "goal_progress_entries_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "swing_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_progress_entries_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "athlete_goals"
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
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          name: string
          source: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          name: string
          source?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          name?: string
          source?: string
          user_id?: string | null
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
      notification_preferences: {
        Row: {
          browser_notifications: boolean | null
          created_at: string
          email_notifications: boolean | null
          id: string
          notify_on_achievements: boolean | null
          notify_on_messages: boolean | null
          notify_on_reports: boolean | null
          notify_on_schedule: boolean | null
          sound_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          browser_notifications?: boolean | null
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          notify_on_achievements?: boolean | null
          notify_on_messages?: boolean | null
          notify_on_reports?: boolean | null
          notify_on_schedule?: boolean | null
          sound_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          browser_notifications?: boolean | null
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          notify_on_achievements?: boolean | null
          notify_on_messages?: boolean | null
          notify_on_reports?: boolean | null
          notify_on_schedule?: boolean | null
          sound_enabled?: boolean | null
          updated_at?: string
          user_id?: string
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
      parent_coach_messages: {
        Row: {
          athlete_id: string
          coach_id: string
          created_at: string
          id: string
          is_read: boolean | null
          message_content: string
          parent_user_id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          athlete_id: string
          coach_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_content: string
          parent_user_id: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          athlete_id?: string
          coach_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_content?: string
          parent_user_id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: []
      }
      parent_guardians: {
        Row: {
          athlete_id: string
          created_at: string
          id: string
          is_primary: boolean | null
          parent_user_id: string
          relationship: string
          updated_at: string
        }
        Insert: {
          athlete_id: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          parent_user_id: string
          relationship: string
          updated_at?: string
        }
        Update: {
          athlete_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          parent_user_id?: string
          relationship?: string
          updated_at?: string
        }
        Relationships: []
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
          throws: string | null
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
          throws?: string | null
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
          throws?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      practice_journal: {
        Row: {
          content: string
          created_at: string
          energy_level: number | null
          entry_type: string
          focus_level: number | null
          id: string
          mood: string | null
          player_id: string | null
          related_analysis_id: string | null
          session_date: string
          tags: string[] | null
          title: string | null
          updated_at: string
          user_id: string
          voice_recorded: boolean | null
        }
        Insert: {
          content: string
          created_at?: string
          energy_level?: number | null
          entry_type?: string
          focus_level?: number | null
          id?: string
          mood?: string | null
          player_id?: string | null
          related_analysis_id?: string | null
          session_date?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
          voice_recorded?: boolean | null
        }
        Update: {
          content?: string
          created_at?: string
          energy_level?: number | null
          entry_type?: string
          focus_level?: number | null
          id?: string
          mood?: string | null
          player_id?: string | null
          related_analysis_id?: string | null
          session_date?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
          voice_recorded?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_journal_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_journal_related_analysis_id_fkey"
            columns: ["related_analysis_id"]
            isOneToOne: false
            referencedRelation: "swing_analyses"
            referencedColumns: ["id"]
          },
        ]
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
          batting_hand: string | null
          biggest_challenge: string | null
          birth_date: string | null
          created_at: string | null
          current_level: string | null
          email: string
          experience_level: string | null
          first_name: string
          height_inches: number | null
          id: string
          last_active_at: string | null
          last_name: string
          motivation: string | null
          onboarding_completed: boolean | null
          phone: string | null
          position: string[] | null
          practice_reminders_enabled: boolean | null
          primary_goal: string | null
          profile_last_updated: string | null
          referral_source: string | null
          updated_at: string | null
          weight_lbs: number | null
          whop_user_id: string | null
          whop_username: string | null
          years_playing: number | null
        }
        Insert: {
          batting_hand?: string | null
          biggest_challenge?: string | null
          birth_date?: string | null
          created_at?: string | null
          current_level?: string | null
          email: string
          experience_level?: string | null
          first_name: string
          height_inches?: number | null
          id: string
          last_active_at?: string | null
          last_name: string
          motivation?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          position?: string[] | null
          practice_reminders_enabled?: boolean | null
          primary_goal?: string | null
          profile_last_updated?: string | null
          referral_source?: string | null
          updated_at?: string | null
          weight_lbs?: number | null
          whop_user_id?: string | null
          whop_username?: string | null
          years_playing?: number | null
        }
        Update: {
          batting_hand?: string | null
          biggest_challenge?: string | null
          birth_date?: string | null
          created_at?: string | null
          current_level?: string | null
          email?: string
          experience_level?: string | null
          first_name?: string
          height_inches?: number | null
          id?: string
          last_active_at?: string | null
          last_name?: string
          motivation?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          position?: string[] | null
          practice_reminders_enabled?: boolean | null
          primary_goal?: string | null
          profile_last_updated?: string | null
          referral_source?: string | null
          updated_at?: string | null
          weight_lbs?: number | null
          whop_user_id?: string | null
          whop_username?: string | null
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
      reboot_reports: {
        Row: {
          archetype: string
          attack_angle: number | null
          body_score: number
          com_avg_accel_rate: number | null
          com_avg_decel_rate: number | null
          com_dist_foot_down: number | null
          com_dist_max_forward: number | null
          com_dist_neg_move: number | null
          connection_at_impact: number | null
          created_at: string
          early_connection: number | null
          energy_transfer_efficiency: number | null
          fire_duration: number
          fire_duration_score: number
          forward_momentum_pct: number | null
          frontal_tilt_foot_down: number | null
          frontal_tilt_max_hand_velo: number | null
          height: number | null
          hip_shoulder_separation: number | null
          id: string
          kinematic_sequence_gap: number
          label: string
          lateral_tilt_foot_down: number | null
          lateral_tilt_max_hand_velo: number | null
          linear_power: number | null
          load_duration: number
          max_pelvis_turn_time: number
          max_shoulder_turn_time: number
          max_x_factor_time: number
          min_com_velocity: number | null
          mlb_avg_max_pelvis_turn: number | null
          mlb_avg_max_shoulder_turn: number | null
          mlb_avg_x_factor: number | null
          momentum_direction_angle: number | null
          negative_move_time: number
          pdf_url: string
          peak_arm_rot_vel: number | null
          peak_arm_rot_vel_std_dev: number | null
          peak_bat_speed: number | null
          peak_com_velocity: number | null
          peak_pelvis_rot_vel: number | null
          peak_pelvis_rot_vel_std_dev: number | null
          peak_shoulder_rot_vel: number | null
          peak_shoulder_rot_vel_std_dev: number | null
          pelvis_direction_impact: number | null
          pelvis_direction_max_pelvis: number | null
          pelvis_direction_neg_move: number | null
          pelvis_direction_stance: number | null
          player_id: string | null
          posture_angle: number | null
          report_date: string
          rotational_power: number | null
          shoulder_direction_impact: number | null
          shoulder_direction_max_shoulder: number | null
          shoulder_direction_neg_move: number | null
          shoulder_direction_stance: number | null
          stride_length_meters: number | null
          stride_length_pct_height: number | null
          tempo_ratio: number
          tempo_ratio_score: number
          total_power: number | null
          transfer_efficiency: number | null
          updated_at: string
          upload_date: string
          user_id: string
          vertical_bat_angle: number | null
          weight: number | null
          x_factor: number | null
          x_factor_angle: number | null
          x_factor_impact: number | null
          x_factor_max_pelvis: number | null
          x_factor_neg_move: number | null
          x_factor_stance: number | null
        }
        Insert: {
          archetype: string
          attack_angle?: number | null
          body_score: number
          com_avg_accel_rate?: number | null
          com_avg_decel_rate?: number | null
          com_dist_foot_down?: number | null
          com_dist_max_forward?: number | null
          com_dist_neg_move?: number | null
          connection_at_impact?: number | null
          created_at?: string
          early_connection?: number | null
          energy_transfer_efficiency?: number | null
          fire_duration: number
          fire_duration_score: number
          forward_momentum_pct?: number | null
          frontal_tilt_foot_down?: number | null
          frontal_tilt_max_hand_velo?: number | null
          height?: number | null
          hip_shoulder_separation?: number | null
          id?: string
          kinematic_sequence_gap: number
          label: string
          lateral_tilt_foot_down?: number | null
          lateral_tilt_max_hand_velo?: number | null
          linear_power?: number | null
          load_duration: number
          max_pelvis_turn_time: number
          max_shoulder_turn_time: number
          max_x_factor_time: number
          min_com_velocity?: number | null
          mlb_avg_max_pelvis_turn?: number | null
          mlb_avg_max_shoulder_turn?: number | null
          mlb_avg_x_factor?: number | null
          momentum_direction_angle?: number | null
          negative_move_time: number
          pdf_url: string
          peak_arm_rot_vel?: number | null
          peak_arm_rot_vel_std_dev?: number | null
          peak_bat_speed?: number | null
          peak_com_velocity?: number | null
          peak_pelvis_rot_vel?: number | null
          peak_pelvis_rot_vel_std_dev?: number | null
          peak_shoulder_rot_vel?: number | null
          peak_shoulder_rot_vel_std_dev?: number | null
          pelvis_direction_impact?: number | null
          pelvis_direction_max_pelvis?: number | null
          pelvis_direction_neg_move?: number | null
          pelvis_direction_stance?: number | null
          player_id?: string | null
          posture_angle?: number | null
          report_date: string
          rotational_power?: number | null
          shoulder_direction_impact?: number | null
          shoulder_direction_max_shoulder?: number | null
          shoulder_direction_neg_move?: number | null
          shoulder_direction_stance?: number | null
          stride_length_meters?: number | null
          stride_length_pct_height?: number | null
          tempo_ratio: number
          tempo_ratio_score: number
          total_power?: number | null
          transfer_efficiency?: number | null
          updated_at?: string
          upload_date?: string
          user_id: string
          vertical_bat_angle?: number | null
          weight?: number | null
          x_factor?: number | null
          x_factor_angle?: number | null
          x_factor_impact?: number | null
          x_factor_max_pelvis?: number | null
          x_factor_neg_move?: number | null
          x_factor_stance?: number | null
        }
        Update: {
          archetype?: string
          attack_angle?: number | null
          body_score?: number
          com_avg_accel_rate?: number | null
          com_avg_decel_rate?: number | null
          com_dist_foot_down?: number | null
          com_dist_max_forward?: number | null
          com_dist_neg_move?: number | null
          connection_at_impact?: number | null
          created_at?: string
          early_connection?: number | null
          energy_transfer_efficiency?: number | null
          fire_duration?: number
          fire_duration_score?: number
          forward_momentum_pct?: number | null
          frontal_tilt_foot_down?: number | null
          frontal_tilt_max_hand_velo?: number | null
          height?: number | null
          hip_shoulder_separation?: number | null
          id?: string
          kinematic_sequence_gap?: number
          label?: string
          lateral_tilt_foot_down?: number | null
          lateral_tilt_max_hand_velo?: number | null
          linear_power?: number | null
          load_duration?: number
          max_pelvis_turn_time?: number
          max_shoulder_turn_time?: number
          max_x_factor_time?: number
          min_com_velocity?: number | null
          mlb_avg_max_pelvis_turn?: number | null
          mlb_avg_max_shoulder_turn?: number | null
          mlb_avg_x_factor?: number | null
          momentum_direction_angle?: number | null
          negative_move_time?: number
          pdf_url?: string
          peak_arm_rot_vel?: number | null
          peak_arm_rot_vel_std_dev?: number | null
          peak_bat_speed?: number | null
          peak_com_velocity?: number | null
          peak_pelvis_rot_vel?: number | null
          peak_pelvis_rot_vel_std_dev?: number | null
          peak_shoulder_rot_vel?: number | null
          peak_shoulder_rot_vel_std_dev?: number | null
          pelvis_direction_impact?: number | null
          pelvis_direction_max_pelvis?: number | null
          pelvis_direction_neg_move?: number | null
          pelvis_direction_stance?: number | null
          player_id?: string | null
          posture_angle?: number | null
          report_date?: string
          rotational_power?: number | null
          shoulder_direction_impact?: number | null
          shoulder_direction_max_shoulder?: number | null
          shoulder_direction_neg_move?: number | null
          shoulder_direction_stance?: number | null
          stride_length_meters?: number | null
          stride_length_pct_height?: number | null
          tempo_ratio?: number
          tempo_ratio_score?: number
          total_power?: number | null
          transfer_efficiency?: number | null
          updated_at?: string
          upload_date?: string
          user_id?: string
          vertical_bat_angle?: number | null
          weight?: number | null
          x_factor?: number | null
          x_factor_angle?: number | null
          x_factor_impact?: number | null
          x_factor_max_pelvis?: number | null
          x_factor_neg_move?: number | null
          x_factor_stance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reboot_reports_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      report_schedules: {
        Row: {
          created_at: string | null
          email_delivery: boolean | null
          frequency: string
          id: string
          is_active: boolean | null
          last_generated_at: string | null
          next_generation_date: string
          player_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_delivery?: boolean | null
          frequency: string
          id?: string
          is_active?: boolean | null
          last_generated_at?: string | null
          next_generation_date: string
          player_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_delivery?: boolean | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_generated_at?: string | null
          next_generation_date?: string
          player_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_schedules_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          attack_angle: number | null
          ball_score: number | null
          bat_path_plane: number | null
          bat_score: number | null
          body_score: number | null
          brain_score: number | null
          connection_quality: number | null
          created_at: string
          direction_score: number | null
          drill_effectiveness_score: number | null
          drill_feedback: Json | null
          drill_id: string | null
          drill_name: string | null
          efficiency_score: number | null
          engine_score: number
          id: string
          metrics: Json
          overall_score: number
          player_id: string | null
          session_id: string | null
          swing_mechanics_quality_score: number | null
          timing_score: number | null
          user_id: string | null
          video_type: string
          video_url: string | null
          whip_score: number
        }
        Insert: {
          anchor_score: number
          attack_angle?: number | null
          ball_score?: number | null
          bat_path_plane?: number | null
          bat_score?: number | null
          body_score?: number | null
          brain_score?: number | null
          connection_quality?: number | null
          created_at?: string
          direction_score?: number | null
          drill_effectiveness_score?: number | null
          drill_feedback?: Json | null
          drill_id?: string | null
          drill_name?: string | null
          efficiency_score?: number | null
          engine_score: number
          id?: string
          metrics: Json
          overall_score: number
          player_id?: string | null
          session_id?: string | null
          swing_mechanics_quality_score?: number | null
          timing_score?: number | null
          user_id?: string | null
          video_type?: string
          video_url?: string | null
          whip_score: number
        }
        Update: {
          anchor_score?: number
          attack_angle?: number | null
          ball_score?: number | null
          bat_path_plane?: number | null
          bat_score?: number | null
          body_score?: number | null
          brain_score?: number | null
          connection_quality?: number | null
          created_at?: string
          direction_score?: number | null
          drill_effectiveness_score?: number | null
          drill_feedback?: Json | null
          drill_id?: string | null
          drill_name?: string | null
          efficiency_score?: number | null
          engine_score?: number
          id?: string
          metrics?: Json
          overall_score?: number
          player_id?: string | null
          session_id?: string | null
          swing_mechanics_quality_score?: number | null
          timing_score?: number | null
          user_id?: string | null
          video_type?: string
          video_url?: string | null
          whip_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "swing_analyses_drill_id_fkey"
            columns: ["drill_id"]
            isOneToOne: false
            referencedRelation: "drill_effectiveness"
            referencedColumns: ["drill_id"]
          },
          {
            foreignKeyName: "swing_analyses_drill_id_fkey"
            columns: ["drill_id"]
            isOneToOne: false
            referencedRelation: "drills"
            referencedColumns: ["id"]
          },
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
      team_challenges: {
        Row: {
          challenge_type: string
          coach_id: string
          created_at: string
          description: string | null
          end_date: string
          id: string
          is_public: boolean | null
          metric_target: string | null
          prizes: Json | null
          rules: string | null
          start_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          challenge_type: string
          coach_id: string
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          is_public?: boolean | null
          metric_target?: string | null
          prizes?: Json | null
          rules?: string | null
          start_date: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          challenge_type?: string
          coach_id?: string
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          is_public?: boolean | null
          metric_target?: string | null
          prizes?: Json | null
          rules?: string | null
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
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
          practice_days: Json | null
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
          practice_days?: Json | null
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
          practice_days?: Json | null
          total_checkins?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          completed_at: string | null
          created_at: string
          current_value: number
          deadline: string | null
          id: string
          metric_category: string
          metric_name: string
          player_id: string | null
          status: string
          target_value: number
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_value: number
          deadline?: string | null
          id?: string
          metric_category: string
          metric_name: string
          player_id?: string | null
          status?: string
          target_value: number
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_value?: number
          deadline?: string | null
          id?: string
          metric_category?: string
          metric_name?: string
          player_id?: string | null
          status?: string
          target_value?: number
          unit?: string
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
          membershipio_id: string | null
          started_at: string
          status: string
          swing_count: number | null
          tier: Database["public"]["Enums"]["membership_tier"]
          updated_at: string
          user_id: string
          whop_membership_id: string | null
          whop_plan_id: string | null
          whop_product_id: string | null
          whop_user_id: string | null
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          membershipio_id?: string | null
          started_at?: string
          status?: string
          swing_count?: number | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
          user_id: string
          whop_membership_id?: string | null
          whop_plan_id?: string | null
          whop_product_id?: string | null
          whop_user_id?: string | null
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          membershipio_id?: string | null
          started_at?: string
          status?: string
          swing_count?: number | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
          user_id?: string
          whop_membership_id?: string | null
          whop_plan_id?: string | null
          whop_product_id?: string | null
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
      challenge_leaderboard: {
        Row: {
          baseline_score: number | null
          challenge_id: string | null
          current_score: number | null
          first_name: string | null
          improvement_percentage: number | null
          last_name: string | null
          player_id: string | null
          rank: number | null
          swings_completed: number | null
          team_name: string | null
          user_first_name: string | null
          user_id: string | null
          user_last_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "team_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_participants_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      drill_effectiveness: {
        Row: {
          avg_anchor_score: number | null
          avg_bat_speed: number | null
          avg_engine_score: number | null
          avg_fire_sequence: number | null
          avg_overall_score: number | null
          avg_whip_score: number | null
          difficulty: number | null
          drill_id: string | null
          drill_name: string | null
          first_used: string | null
          last_used: string | null
          pillar: string | null
          total_uses: number | null
        }
        Relationships: []
      }
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
      is_coach_of_challenge: {
        Args: { _challenge_id: string; _user_id: string }
        Returns: boolean
      }
      is_user_in_challenge: {
        Args: { _challenge_id: string; _user_id: string }
        Returns: boolean
      }
      update_challenge_participant_score: {
        Args: { _challenge_id: string; _player_id?: string; _user_id: string }
        Returns: undefined
      }
      update_challenge_status: { Args: never; Returns: undefined }
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
