import { supabase } from '../lib/supabaseClient';
import { commonModel } from '../models/commonModel';

export class AdminEditController {
  static async getUser(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, account_type, created_at')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async saveUser(
    id: string,
    vals: { name: string; account_type: string }
  ) {
    return commonModel.updateRow<typeof vals>('users', id, vals);
  }
}
