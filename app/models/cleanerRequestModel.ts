// models/cleanerRequestModel.ts
import { supabase } from '../lib/supabaseClient';

export type CleanerRequest = {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
};

/** ← all “pending” cleaners */
export async function fetchPendingRequests(): Promise<CleanerRequest[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, status')
    .eq('account_type', 'cleaner')
    .eq('status', 'pending');

  if (error) {
    console.error('[Supabase] fetch error:', error.message);
    return [];
  }
  return data as CleanerRequest[];
}

export async function setCleanerStatus(
  id: string,
  status: 'approved' | 'rejected'
): Promise<boolean> {
  const { error } = await supabase
    .from('users')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('[Supabase] update error:', error.message);
    return false;
  }
  return true;
}
