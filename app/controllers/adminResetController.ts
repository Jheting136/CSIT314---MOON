/* controllers/adminResetController.ts – browser-side */
import { supabase } from '../lib/supabaseClient';

/**
 * Sends a password-reset email that brings the user to /reset-password.
 */
export async function forceResetPassword(email: string): Promise<boolean> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`   
  });

  if (error) {
    console.error('[Supabase] resetPasswordForEmail error:', error.message);
    return false;
  }
  return true;  // e-mail queued 
}
