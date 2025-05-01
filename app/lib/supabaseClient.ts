import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://okxdcgtpvomdmhdfrdgx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9reGRjZ3Rwdm9tZG1oZGZyZGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MTMxOTgsImV4cCI6MjA2MDk4OTE5OH0.K6mI_xk63xy-7CMKN37DGU4SxMy69l2S6eLzDANrghE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);