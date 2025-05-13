// services/UserProfileService.ts
import { supabase } from "../lib/supabaseClient";

export class UserProfileService {
  constructor(private userId: string) {}

  async fetchUserData() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', this.userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateBio(bio: string) {
    const { error } = await supabase
      .from('users')
      .update({ bio })
      .eq('id', this.userId);

    if (error) throw error;
  }
}
