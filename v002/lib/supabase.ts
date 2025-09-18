import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create client if credentials are provided
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const isSupabaseConfigured = () => {
  return !!supabase
}

export type Project = {
  id?: string
  name: string
  screens: any[] // Using the existing Screen type structure
  device_type: string
  created_at?: string
  updated_at?: string
  is_public?: boolean
  share_id?: string // For sharing without auth
}