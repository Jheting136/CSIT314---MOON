import { supabase } from "../lib/supabaseClient"; // requires installing supabase client

export class commonModel {
  static async getData(
    table: string,
    columns: string,
    filters?: { column: string; operator: string; value: any }[],
    page: number,
    pageSize: number
  ): Promise<any[]> {
    let query = supabase
      .from(table)
      .select(columns, { count: "exact" })
      .range((page - 1) * pageSize, page * pageSize - 1);

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

  static async deleteUser(table: string, id: string): Promise<boolean> {
    const { error } = await supabase.from(table).delete().eq("id", id);

    if (error) {
      console.error(`Error deleting row from ${table}:`, error.message);
      return false;
    }

    return true;
  }
  /** ── UPDATE helper ───────────────────────────────────────── */
  static async updateRow<T extends object>(
    table: string,
    id: string,
    values: Partial<T>
  ) {
    const { error, data } = await supabase // ← keep your import
      .from(table)
      .update(values)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data; // updated row
  }

  static async setUserStatus<T extends string>(
    table: string,
    id: string,
    statusColumn: string,
    statusValue: T
  ): Promise<boolean> {
    const { error } = await supabase
      .from(table)
      .update({ [statusColumn]: statusValue })
      .eq("id", id);

    if (error) {
      console.error(
        `[Supabase] Failed to update ${statusColumn} on ${table}:`,
        error.message
      );
      return false;
    }

    return true;
  }

  /**
   * Insert data into a table
   */
  static async insertData(
    table: string,
    data: Record<string, any>
  ): Promise<any> {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error(`Error inserting data into ${table}:`, error.message);
      throw error;
    }

    return result;
  }

  /**
   * Check if a record exists
   */
  static async recordExists(
    table: string,
    conditions: Record<string, any>
  ): Promise<boolean> {
    let query = supabase.from(table).select("id");

    // Apply all conditions
    Object.entries(conditions).forEach(([column, value]) => {
      query = query.eq(column, value);
    });

    const { data, error, count } = await query.limit(1);

    if (error) {
      console.error(`Error checking record in ${table}:`, error.message);
      throw error;
    }

    return count !== null && count > 0;
  }

  /**
   * Delete a record based on conditions
   */
  static async deleteRecord(
    table: string,
    conditions: Record<string, any>
  ): Promise<void> {
    let query = supabase.from(table).delete();

    // Apply all conditions
    Object.entries(conditions).forEach(([column, value]) => {
      query = query.eq(column, value);
    });

    const { error } = await query;

    if (error) {
      console.error(`Error deleting record from ${table}:`, error.message);
      throw error;
    }
  }

  /**
   * Get records with specific conditions
   */
  static async getRecords(
    table: string,
    columns: string,
    conditions: Record<string, any>
  ): Promise<any[]> {
    let query = supabase.from(table).select(columns);

    // Apply all conditions
    Object.entries(conditions).forEach(([column, value]) => {
      query = query.eq(column, value);
    });

    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching records from ${table}:`, error.message);
      throw error;
    }

    return data || [];
  }
}
