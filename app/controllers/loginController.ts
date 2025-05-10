import { loginUser, fetchUserProfile } from "../models/loginModel";

export async function handleLogin(
  email: string,
  password: string
): Promise<string | null> {
  const { data, error } = await loginUser(email, password);
  if (error) return "Login failed: " + error.message;

  const { data: profile, error: profileError } = await fetchUserProfile(
    data.id
  );
  if (profileError || !profile) return "Unable to fetch user role.";

  // Save user ID to local storage
  localStorage.setItem("userId", data.id);

  const role = profile.account_type;

  if (role === "admin") window.location.href = "/admin";
  else if (role === "cleaner") window.location.href = "/cleaner";
  else window.location.href = "/homeowner";

  return null;
}
