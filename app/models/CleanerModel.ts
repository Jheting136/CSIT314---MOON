import { supabase } from "../lib/supabaseClient";

export class Cleaner {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public bio: string,
    public account_type: string,
    public rates?: number
  ) {}

  async updateBio(newBio: string) {
    const { error } = await supabase
      .from("users")
      .update({ bio: newBio })
      .eq("id", this.id);
    if (error) throw error;
    this.bio = newBio;
  }
}