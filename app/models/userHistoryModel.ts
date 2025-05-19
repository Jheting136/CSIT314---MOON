import { commonModel } from './commonModel';

export interface History {
  id: string;
  service: string;
  location: string;
  date: string;
  status: string;
  rating?: number;
  homeowner_id?: string;
  homeowner?: { name: string } | { name: string }[]; // Accept both formats
  customer_name: string;
}

export async function getHistory(id: string, filters: Array<{ column: string; operator: string; value: string }>): Promise<History[]> {
  // Step 1: Retrieve account_type from 'users' table
  const { data: userData, error: userError } = await commonModel.getData(
    'users',
    'account_type',
    [{ column: 'id', operator: 'eq', value: id }],
    1,
    1
  );

  if (userError || !userData || userData.length === 0) {
    throw new Error('User not found or failed to retrieve account type.');
  }

  const accountType = userData[0].account_type;

  // Step 2: Determine filter column based on account_type
  let filterColumn = '';
  if (accountType === 'cleaner') {
    filterColumn = 'cleaner_id';
  } else if (accountType === 'homeowner') {
    filterColumn = 'homeowner_id';
  } else {
    throw new Error(`Unsupported account type: ${accountType}`);
  }

  const baseFilters = [{ column: filterColumn, operator: 'eq', value: id }];

  const allFilters = [...baseFilters, ...filters];

  const { data: jobData, error: jobError } = await commonModel.getData(
    'jobs',
    'id, service, location, date, status, rating',
    allFilters,
    1,
    10
  );

  if (jobError || !jobData) {
    throw new Error('Failed to fetch job history.');
  }

  return jobData as History[];
}

// import { supabase } from '../lib/supabaseClient';
//
// export type HistoryItem = {
//   id: string;
//   service: string;
//   location: string;
//   date: string;   // ISO
//   status: string;
//   rating?: number;
// };
//
// export async function fetchHistoryByUser(
//   userId: string
// ): Promise<HistoryItem[]> {
//   const { data, error } = await supabase
//     .from('jobs')
//     .select('id, service, location, date, status')
//     .eq('user_id', userId)
//     .order('date', { ascending: false });
//
//   if (error) {
//     console.error('[Supabase] get history:', error.message);
//     return [];
//   }
//   return data as HistoryItem[];
// }
