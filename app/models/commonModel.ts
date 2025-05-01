import { supabase } from '../lib/supabaseClient'; // requires installing supabase client

export class commonModel {
  static async getData(
    table: string,
    columns: string,
    filters?: { column: string, operator: string, value: any }[],
    page: number,
    pageSize: number
  ): Promise<any[]> {
    let query = supabase.from(table).select(columns, { count: 'exact' }).range((page - 1) * pageSize, page * pageSize - 1);

    // Apply filters
    if (filters) {
      for (const f of filters) {
        query = query.filter(f.column, f.operator, f.value);
      }
    }

    const { data, error, count } = await query;
    if (error) {
        console.error(`Error fetching data from ${table}:`, error.message);
        throw error;
    }

    return { data, count: count || 0 };
  }
}