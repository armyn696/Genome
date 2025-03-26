import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iiwpojddhbuvdttjrpzt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpd3BvamRkaGJ1dmR0dGpycHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NTI3NzcsImV4cCI6MjA1MjQyODc3N30.Sm8yxCM2xcqHzN69iyaBF7Nvuk7lpcJEp6i770zwhz0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
})
