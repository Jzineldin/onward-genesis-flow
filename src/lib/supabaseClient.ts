
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://polrfcwldhqlbpgrugyg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvbHJmY3dsZGhxbGJwZ3J1Z3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDUxNDksImV4cCI6MjA2NTQ4MTE0OX0.-9BmVdIa4ted76kPIXtpY6BEFzS-AwsRuM7CzHagDcQ";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY
);

console.log('[INIT] Supabase client created');
