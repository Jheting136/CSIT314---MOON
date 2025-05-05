// src/controllers/logoutController.ts
import { supabase } from '../lib/supabaseClient';

export async function handleLogout(): Promise<void> {
  await supabase.auth.signOut();
  window.location.href = '/login'; // or '/' if you prefer
}
