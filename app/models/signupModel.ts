import { supabase } from "../lib/supabaseClient";

export async function insertUserEntity(user: {
  email: string;
  name: string;
  password: string;
  account_type: string;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from("users").insert(user);
  return { error: error?.message || null };
}
