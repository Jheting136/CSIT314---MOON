import { supabase } from "../lib/supabaseClient";

export async function loginUser(email: string, password: string) {
  return await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .eq("password", password)
    .single();
}

export async function fetchUserProfile(userId: string) {
  return await supabase
    .from("users")
    .select("account_type")
    .eq("id", userId)
    .single();
}
