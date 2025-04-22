import { supabase } from '../lib/supabaseClient'; //requires installing supabase client

export class DataEntity {
  static async getData(
    table: string,
    columns: string = '*',
    filters?: { column: string, operator: string, value: any }[]
  ): Promise<any[]> {
    let query = supabase.from(table).select(columns);

    if (filters) {
      for (const f of filters) {
        query = query.filter(f.column, f.operator, f.value);
        // you can also use .eq(), .neq(), etc. depending on your needs
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching from ${table}:`, error.message);
      throw error;
    }

    return data || [];
  }
}
