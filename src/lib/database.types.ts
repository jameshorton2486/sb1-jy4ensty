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
      legal_professionals: {
        Row: {
          id: string
          user_id: string
          type: 'attorney' | 'court_reporter' | 'videographer' | 'scopist'
          first_name: string
          middle_name: string | null
          last_name: string
          email: string
          phone_office: string | null
          phone_mobile: string
          profile_photo_url: string | null
          emergency_contact_info: Json
          preferred_payment_methods: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'attorney' | 'court_reporter' | 'videographer' | 'scopist'
          first_name: string
          middle_name?: string | null
          last_name: string
          email: string
          phone_office?: string | null
          phone_mobile: string
          profile_photo_url?: string | null
          emergency_contact_info?: Json
          preferred_payment_methods?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'attorney' | 'court_reporter' | 'videographer' | 'scopist'
          first_name?: string
          middle_name?: string | null
          last_name?: string
          email?: string
          phone_office?: string | null
          phone_mobile?: string
          profile_photo_url?: string | null
          emergency_contact_info?: Json
          preferred_payment_methods?: Json
          created_at?: string
          updated_at?: string
        }
      }
      professional_details: {
        Row: {
          id: string
          professional_id: string
          details: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          professional_id: string
          details: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          professional_id?: string
          details?: Json
          created_at?: string
          updated_at?: string
        }
      }
      certifications: {
        Row: {
          id: string
          professional_id: string
          type: string
          number: string
          expiry_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          professional_id: string
          type: string
          number: string
          expiry_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          professional_id?: string
          type?: string
          number?: string
          expiry_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      availability_schedules: {
        Row: {
          id: string
          professional_id: string
          schedule: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          professional_id: string
          schedule: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          professional_id?: string
          schedule?: Json
          created_at?: string
          updated_at?: string
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
      professional_type: 'attorney' | 'court_reporter' | 'videographer' | 'scopist'
    }
  }
}