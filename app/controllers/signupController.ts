import { supabase } from "../lib/supabaseClient";
import { insertUserEntity } from "../models/signupModel"; // Entity

export async function handleSignup({
  email,
  password,
  name,
  accountType
}: {
  email: string;
  password: string;
  name: string;
  accountType: string;
}): Promise<string | null> {
  const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

  if (signUpError || !data.user) {
    return signUpError?.message || "Signup failed";
  }

  const { error: insertError } = await insertUserEntity({
    id: data.user.id,
    email,
    name,
    account_type: accountType,
  });

  if (insertError) return insertError;

  window.location.href = "/login";
  return null;
}
