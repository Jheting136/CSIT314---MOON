import { loginUser, getCurrentUser, fetchUserProfile } from "../models/loginModel";

export async function handleLogin(email: string, password: string): Promise<string | null> {
  const { error } = await loginUser(email, password);
  if (error) return "Login failed: " + error.message;

  const user = await getCurrentUser();
  if (!user) return "Failed to retrieve user info.";

  const { data: profile, error: profileError } = await fetchUserProfile(user.id);
  if (profileError || !profile) return "Unable to fetch user role.";

  const role = profile.account_type;
  if (role === "admin") window.location.href = "/admin";
  else if (role === "cleaner") window.location.href = "/cleaner";
  else window.location.href = "/homeowner";

  return null;
}
