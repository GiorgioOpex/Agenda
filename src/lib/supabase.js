import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://shgxypwmaxloyzemdbcw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZ3h5cHdtYXhsb3l6ZW1kYmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDI0MzEsImV4cCI6MjA5MjI3ODQzMX0.rxx8scqTZw2-c5xHslxXKOJJpR59IjPoMx5gzlHUWXQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
