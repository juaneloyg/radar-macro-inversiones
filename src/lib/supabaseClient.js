import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lkoizdlmsbwyzjvgtoej.supabase.co'
const supabaseAnonKey = 'sb_publishable_xGHZRrtthdqIwAOanNtEgA_56QLeKmS'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)