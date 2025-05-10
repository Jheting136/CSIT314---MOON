import { insertUserEntity } from "../models/signupModel"; // Entity

export async function handleSignup({
  email,
  password,
  name,
  accountType,
}: {
  email: string;
  password: string;
  name: string;
  accountType: string;
}): Promise<string | null> {
  const { error: insertError } = await insertUserEntity({
    email,
    name,
    password,
    account_type: accountType,
  });

  if (insertError) return insertError;

  window.location.href = "/login";
  return null;
}
