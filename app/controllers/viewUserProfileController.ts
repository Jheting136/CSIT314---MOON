// controllers/viewUserProfileController.ts
import { supabase } from '../lib/supabaseClient';      
       
export async function fetchUserById(id: string) {
  if (!id) return null;

  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, account_type, created_at')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[Supabase] fetchUserById:', error.message);
    return null;
  }
  return data as User;
}
