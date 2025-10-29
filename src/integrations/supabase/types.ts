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
      drills: {
        Row: {
          created_at: string
          description: string
          difficulty: number
          duration: number
          id: string
          instructions: string | null
          name: string
          pillar: string
          thumbnail_url: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description: string
          difficulty: number
          duration: number
          id?: string
          instructions?: string | null
          name: string
          pillar: string
          thumbnail_url?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          difficulty?: number
          duration?: number
          id?: string
          instructions?: string | null
          name?: string
          pillar?: string
          thumbnail_url?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
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
      players: {
        Row: {
          age: number | null
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          handedness: string | null
          id: string
          is_active: boolean | null
          jersey_number: string | null
          name: string
          notes: string | null
          organization: string | null
          position: string | null
          team_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          handedness?: string | null
          id?: string
          is_active?: boolean | null
          jersey_number?: string | null
          name: string
          notes?: string | null
          organization?: string | null
          position?: string | null
          team_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          handedness?: string | null
          id?: string
          is_active?: boolean | null
          jersey_number?: string | null
          name?: string
          notes?: string | null
          organization?: string | null
          position?: string | null
          team_name?: string | null
          updated_at?: string
          user_id?: string
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
      swing_analyses: {
        Row: {
          anchor_score: number
          created_at: string
          engine_score: number
          id: string
          metrics: Json
          overall_score: number
          player_id: string | null
          session_id: string | null
          user_id: string | null
          video_url: string | null
          whip_score: number
        }
        Insert: {
          anchor_score: number
          created_at?: string
          engine_score: number
          id?: string
          metrics: Json
          overall_score: number
          player_id?: string | null
          session_id?: string | null
          user_id?: string | null
          video_url?: string | null
          whip_score: number
        }
        Update: {
          anchor_score?: number
          created_at?: string
          engine_score?: number
          id?: string
          metrics?: Json
          overall_score?: number
          player_id?: string | null
          session_id?: string | null
          user_id?: string | null
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
    Enums: {},
  },
} as const
