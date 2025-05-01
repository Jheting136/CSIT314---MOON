import { supabase } from "../lib/supabaseClient";

export async function loginUser(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function fetchUserProfile(userId: string) {
  return await supabase
    .from("users")
    .select("account_type")
    .eq("id", userId)
    .single();
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}
