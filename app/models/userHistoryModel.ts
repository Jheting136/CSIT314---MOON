// models/userHistoryModel.ts
import { supabase } from '../lib/supabaseClient';

export type HistoryItem = {
  id: string;
  service: string;
  location: string;
  date: string;   // ISO
  status: string;
  rating?: number;
};

export async function fetchHistoryByUser(
  userId: string
): Promise<HistoryItem[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('id, service, location, date, status')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('[Supabase] get history:', error.message);
    return [];
  }
  return data as HistoryItem[];
}
