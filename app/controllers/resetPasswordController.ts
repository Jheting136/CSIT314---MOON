import { supabase } from "../lib/supabaseClient";

/** completes the recovery flow */
export async function updatePassword(
  accessToken: string,
  newPassword: string
): Promise<boolean> {
  if (!accessToken) return false;

  /* Tell Supabase to treat this token as the current session */
  const { error: sessionErr } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: ""          // not required for password update
  });
  if (sessionErr) {
    console.error("[Supabase] setSession error:", sessionErr.message);
    return false;
  }

  /* Now update the password */
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    console.error("[Supabase] updateUser error:", error.message);
    return false;
  }
  return true;
}
