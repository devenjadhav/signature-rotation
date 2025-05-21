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
      signatures: {
        Row: {
          id: string
          user_id: string
          name: string
          content: string
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          content: string
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          content?: string
          active?: boolean
          created_at?: string
        }
      }
      settings: {
        Row: {
          user_id: string
          rotation_enabled: boolean
          rotation_frequency: string
          zapier_webhook_url: string
          connected: boolean
        }
        Insert: {
          user_id: string
          rotation_enabled?: boolean
          rotation_frequency?: string
          zapier_webhook_url?: string
          connected?: boolean
        }
        Update: {
          user_id?: string
          rotation_enabled?: boolean
          rotation_frequency?: string
          zapier_webhook_url?: string
          connected?: boolean
        }
      }
    }
  }
} 