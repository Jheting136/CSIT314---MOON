// services/JobService.ts
import { supabase } from "../lib/supabaseClient";
import type { HistoryItem } from "../models/userHistoryModel";

export class JobService {
  constructor(private userId: string) {}

  async fetchCompletedJobs(
    sortOrder: 'asc' | 'desc',
    serviceFilter: string,
    dateRange: { start: string; end: string }
  ): Promise<HistoryItem[]> {
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('cleaner_id', this.userId)
      .eq('status', 'Completed');

    if (serviceFilter) query = query.eq('service', serviceFilter);
    if (dateRange.start) query = query.gte('date', dateRange.start);
    if (dateRange.end) query = query.lte('date', dateRange.end);

    query = query.order('date', { ascending: sortOrder === 'asc' });

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  async fetchBookings(sortOrder: 'asc' | 'desc'): Promise<HistoryItem[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('cleaner_id', this.userId)
      .in('status', ['Pending', 'Approved', 'Rejected'])
      .order('date', { ascending: sortOrder === 'asc' });

    if (error) throw error;
    return data || [];
  }

  async updateStatus(jobId: string, newStatus: string) {
    const { error } = await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', jobId);
    if (error) throw error;
  }

  async fetchAvailableServices(): Promise<string[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('service')
      .eq('cleaner_id', this.userId)
      .eq('status', 'Completed');

    if (error) throw error;
    return Array.from(new Set(data?.map(job => job.service) || []));
  }
}
