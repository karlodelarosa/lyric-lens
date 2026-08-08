export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      announcements: {
        Row: {
          body: string;
          category: string | null;
          created_at: string;
          created_by: string | null;
          expires_at: string | null;
          id: string;
          organization_id: string;
          slides: Json;
          title: string;
          updated_at: string;
        };
        Insert: {
          body?: string;
          category?: string | null;
          created_at?: string;
          created_by?: string | null;
          expires_at?: string | null;
          id?: string;
          organization_id: string;
          slides?: Json;
          title: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          category?: string | null;
          created_at?: string;
          created_by?: string | null;
          expires_at?: string | null;
          id?: string;
          organization_id?: string;
          slides?: Json;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "announcements_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_members: {
        Row: {
          created_at: string;
          id: string;
          organization_id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          organization_id: string;
          role?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          organization_id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          created_at: string;
          created_by: string | null;
          event_date: string;
          id: string;
          organization_id: string;
          setlist_id: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          event_date: string;
          id?: string;
          organization_id: string;
          setlist_id?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          event_date?: string;
          id?: string;
          organization_id?: string;
          setlist_id?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_setlist_id_fkey";
            columns: ["setlist_id"];
            isOneToOne: false;
            referencedRelation: "setlists";
            referencedColumns: ["id"];
          },
        ];
      };
      service_flow_segment_announcements: {
        Row: {
          announcement_id: string;
          id: string;
          position: number;
          segment_id: string;
        };
        Insert: {
          announcement_id: string;
          id?: string;
          position?: number;
          segment_id: string;
        };
        Update: {
          announcement_id?: string;
          id?: string;
          position?: number;
          segment_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_flow_segment_announcements_announcement_id_fkey";
            columns: ["announcement_id"];
            isOneToOne: false;
            referencedRelation: "announcements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_flow_segment_announcements_segment_id_fkey";
            columns: ["segment_id"];
            isOneToOne: false;
            referencedRelation: "service_flow_segments";
            referencedColumns: ["id"];
          },
        ];
      };
      service_flow_segments: {
        Row: {
          created_at: string;
          id: string;
          kind: Database["public"]["Enums"]["service_flow_segment_kind"];
          label: string;
          notes: string | null;
          position: number;
          service_flow_id: string;
          setlist_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["service_flow_segment_kind"];
          label: string;
          notes?: string | null;
          position?: number;
          service_flow_id: string;
          setlist_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["service_flow_segment_kind"];
          label?: string;
          notes?: string | null;
          position?: number;
          service_flow_id?: string;
          setlist_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_flow_segments_service_flow_id_fkey";
            columns: ["service_flow_id"];
            isOneToOne: false;
            referencedRelation: "service_flows";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_flow_segments_setlist_id_fkey";
            columns: ["setlist_id"];
            isOneToOne: false;
            referencedRelation: "setlists";
            referencedColumns: ["id"];
          },
        ];
      };
      service_flows: {
        Row: {
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          organization_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          organization_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          organization_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_flows_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      setlist_songs: {
        Row: {
          created_at: string;
          id: string;
          position: number;
          setlist_id: string;
          song_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          position?: number;
          setlist_id: string;
          song_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          position?: number;
          setlist_id?: string;
          song_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "setlist_songs_setlist_id_fkey";
            columns: ["setlist_id"];
            isOneToOne: false;
            referencedRelation: "setlists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "setlist_songs_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "songs";
            referencedColumns: ["id"];
          },
        ];
      };
      setlists: {
        Row: {
          created_at: string;
          created_by: string | null;
          flow_sections: Json;
          welcome_slide: Json | null;
          id: string;
          organization_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          flow_sections?: Json;
          welcome_slide?: Json | null;
          id?: string;
          organization_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          flow_sections?: Json;
          welcome_slide?: Json | null;
          id?: string;
          organization_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "setlists_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          logo_url: string | null;
          name: string;
          show_org_name_in_sidebar: boolean;
          slug: string;
          theme_preset: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          logo_url?: string | null;
          name: string;
          show_org_name_in_sidebar?: boolean;
          slug: string;
          theme_preset?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          logo_url?: string | null;
          name?: string;
          show_org_name_in_sidebar?: boolean;
          slug?: string;
          theme_preset?: string;
        };
        Relationships: [];
      };
      song_sections: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          intensity: number | null;
          position: number;
          section_number: number | null;
          section_type: string;
          song_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          intensity?: number | null;
          position?: number;
          section_number?: number | null;
          section_type: string;
          song_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          intensity?: number | null;
          position?: number;
          section_number?: number | null;
          section_type?: string;
          song_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "song_sections_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "songs";
            referencedColumns: ["id"];
          },
        ];
      };
      song_tag_links: {
        Row: {
          song_id: string;
          tag_id: string;
        };
        Insert: {
          song_id: string;
          tag_id: string;
        };
        Update: {
          song_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "song_tag_links_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "songs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "song_tag_links_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "song_tags";
            referencedColumns: ["id"];
          },
        ];
      };
      song_tags: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          organization_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          organization_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          organization_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "song_tags_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      songs: {
        Row: {
          artist: string | null;
          background_video_url: string | null;
          created_at: string;
          created_by: string | null;
          id: string;
          organization_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          artist?: string | null;
          background_video_url?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          organization_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          artist?: string | null;
          background_video_url?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          organization_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "songs_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_org_admin: { Args: { org_id: string }; Returns: boolean };
      is_org_member: { Args: { org_id: string }; Returns: boolean };
    };
    Enums: {
      service_flow_segment_kind: "music" | "announcements" | "cue";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
