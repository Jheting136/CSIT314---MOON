// File: app/models/signupModel.ts
import { supabase } from "../lib/supabaseClient";

// Define the type for the user data being inserted, now including an optional status
interface NewUser {
  email: string;
  name: string;
  password: string; // In a real app, this should be hashed before sending to a backend that hashes it again or handled by Supabase Auth directly.
  account_type: string;
  status?: string; // Add status as an optional field
}

/**
 * Inserts a new user entity into the 'users' table.
 * @param {NewUser} user - The user object containing email, name, password, account_type, and optionally status.
 * @returns {Promise<{ error: string | null }>} An object containing an error message if one occurred, or null.
 */
export async function insertUserEntity(user: NewUser): Promise<{ error: string | null }> {
  // Prepare the data for insertion.
  // If status is not provided in the user object, the database default ('active') will be used.
  // However, our controller will now explicitly pass 'pending' for cleaners.
  const userDataToInsert: any = {
    email: user.email,
    name: user.name,
    password: user.password, // Storing plain text passwords is a security risk. Supabase Auth handles hashing if you use its signup.
    account_type: user.account_type,
  };

  if (user.status) {
    userDataToInsert.status = user.status;
  }
  // If user.status is undefined, the 'status' field won't be sent,
  // and the database default ('active') will apply.
  // Our controller will ensure 'pending' is sent for cleaners.

  const { error } = await supabase.from("users").insert(userDataToInsert);
  
  if (error) {
    console.error("[Supabase SignupModel] Error inserting user:", error.message);
    return { error: error.message };
  }
  
  return { error: null };
}
