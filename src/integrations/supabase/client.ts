// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://cjhgoojeiheuhwvuvwck.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqaGdvb2plaWhldWh3dnV2d2NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDE3ODksImV4cCI6MjA2MjYxNzc4OX0.4vhrhjy_vpgvYoXEFBT6rciwvNMtMqK6mzW1ioQSeJg";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);