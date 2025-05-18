// File: app/controllers/signupController.ts
import { insertUserEntity } from "../models/signupModel"; // Entity

interface SignupParams {
  email: string;
  password: string;
  name: string;
  accountType: string;
}

/**
 * Handles the user signup process.
 * Sets initial status to 'pending' for cleaners, 'active' for others.
 * @param {SignupParams} params - The signup parameters including email, password, name, and accountType.
 * @returns {Promise<string | null>} An error message string if signup fails, otherwise null.
 */
export async function handleSignup({
  email,
  password,
  name,
  accountType,
}: SignupParams): Promise<string | null> {
  // Determine the initial status based on the account type.
  // Cleaners should start as 'pending' for admin approval.
  // Other account types (e.g., 'homeowner') can start as 'active'.
  const initialStatus = accountType === "cleaner" ? "pending" : "active";

  // Call the model function to insert the user with the determined status.
  const { error: insertError } = await insertUserEntity({
    email,
    name,
    password, // Reminder: Ensure password handling is secure.
    account_type: accountType,
    status: initialStatus, // Explicitly set the status here
  });

  if (insertError) {
    console.error("[SignupController] Signup failed:", insertError);
    return `Signup failed: ${insertError}`; // Return the error message to the UI
  }

  // Signup successful, redirect to login page.
  // Consider showing a success message before redirecting.
  // For example: alert("Account created successfully! Please log in.");
  window.location.href = "/login";
  return null; // No error
}
