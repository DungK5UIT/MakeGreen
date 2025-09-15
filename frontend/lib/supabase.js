'use client';

import { createClient } from '@supabase/supabase-js';

// Lấy từ biến môi trường (public) – KHÔNG dùng service_role key ở frontend
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Cảnh báo nếu thiếu env (đỡ mất công debug)
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Singleton theo module
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
