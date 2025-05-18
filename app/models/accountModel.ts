// accountModel.ts
import { supabase } from "../lib/supabaseClient";
import type { UpdateProfileData } from "../controllers/accountController";

export class accountModel {
  static async updateProfile(data: UpdateProfileData) {
    const userId = localStorage.getItem("userId");
    if (!userId) throw new Error("No user found");

    const updates: any = {};
    if (data.name) updates.name = data.name;
    if (data.email) updates.email = data.email;
    if (data.newPassword) {
      updates.password = data.newPassword;
    }
    if (typeof data.hourlyRate === "number") {
      updates.rates = data.hourlyRate;
    }

    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId);

    if (error) throw error;
    return true;
  }

  static async getCurrentUser() {
    const userId = localStorage.getItem("userId");
    if (!userId) throw new Error("No user found");

    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, rates")
      .eq("id", userId)
      .single();

    if (error) throw error;
    if (!data) throw new Error("No user found");

    return {
      ...data,
      hourlyRate: data.rates,
    };
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
}
