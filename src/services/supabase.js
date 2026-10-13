// ============================================
// Supabase Client — Frontend Auth & Storage
// ============================================

import { createClient } from '@supabase/supabase-js'

const DEFAULT_SUPABASE_URL = 'https://njbsnjtaihepyoszaxzc.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qYnNuanRhaWhlcHlvc3pheHpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3Mzc0MjYsImV4cCI6MjEwNzMxMzQyNn0.MFeawz8yv7ex4c98s9ltoDckKBblY5GgwMJxERBEpnA'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})