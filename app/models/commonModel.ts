import { supabase } from '../lib/supabaseClient'; //requires installing supabase client

export class DataEntity {
  static async getData(
    table: string,
    columns: string = '*',
    filters?: { column: string, operator: string, value: any }[],
    page?: number,
    pageSize?: number
  ): Promise<{ data: any[], count: number }> {
    let query = supabase
      .from(table)
      .select(columns, { count: 'exact' }); // ✅ count requested

    // Apply filters
    if (filters) {
      for (const f of filters) {
        query = query.filter(f.column, f.operator, f.value);
      }
    }

    // Get count first
    const { data: allData, count, error: countError } = await query;

    if (countError) {
      console.error(`Error fetching count from ${table}:`, countError.message);
      throw countError;
    }

    // Pagination logic
    if (page !== undefined && pageSize !== undefined) {
      const offset = (page - 1) * pageSize;
      if (offset >= count) {
        // Avoid invalid offset
        return { data: [], count };
      }

      query = supabase
        .from(table)
        .select(columns)
        .range(offset, offset + pageSize - 1);

      // Reapply filters for paginated query
      if (filters) {
        for (const f of filters) {
          query = query.filter(f.column, f.operator, f.value);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Error fetching paged data from ${table}:`, error.message);
        throw error;
      }

      return { data: data || [], count };
    }

    return { data: allData || [], count };
  }
}