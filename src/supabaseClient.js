import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase project credentials
const supabaseUrl = 'https://pjfxwtxagyyqlapbifpa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZnh3dHhhZ3l5cWxhcGJpZnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDcwODgsImV4cCI6MjA2NzkyMzA4OH0.2ZbriB_WzwDtlJ_TG0FiEaOdbDKUcwKwTaUtTj8z7tw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 