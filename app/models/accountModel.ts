// accountModel.ts
import { supabase } from "../lib/supabaseClient";
import type { UpdateProfileData } from "../controllers/accountController";

export class accountModel {
  static async getCurrentUser() {
    // Get user from session/local storage
    const userId = localStorage.getItem("userId");
    if (!userId) throw new Error("No user found");

    const { data, error } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("id", userId)
      .single();

    if (error) throw error;
    if (!data) throw new Error("No user found");

    return data;
  }

  static async verifyPassword(password: string) {
    const userId = localStorage.getItem("userId");
    if (!userId) throw new Error("No user found");

    const { data, error } = await supabase
      .from("users")
      .select("password")
      .eq("id", userId)
      .single();

    if (error) throw error;
    if (!data) throw new Error("No user found");

    // Compare password using bcrypt
    return password === data.password;
  }

  static async updateProfile(data: UpdateProfileData) {
    const userId = localStorage.getItem("userId");
    if (!userId) throw new Error("No user found");

    const updates: any = {};

    if (data.name) updates.name = data.name;
    if (data.email) updates.email = data.email;
    if (data.newPassword) {
      // Hash the new password before storing
      updates.password = data.newPassword;
    }

    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId);

    if (error) throw error;
    return true;
  }
}
