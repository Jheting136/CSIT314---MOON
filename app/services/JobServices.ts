// services/JobService.ts
import { supabase } from "../lib/supabaseClient";
import type { History } from "../models/userHistoryModel";

export class JobService {
  constructor(private userId: string) {}

 async fetchCompletedJobs(
    sortOrder: 'asc' | 'desc' = 'desc',
    serviceFilter?: string,
    dateRange?: { start?: string; end?: string }
  ): Promise<History[]> {
    let query = supabase
      .from('jobs')
      .select(`
        id,
        service,
        location,
        date,
        status,
        rating,
        homeowner_id,
        homeowner:homeowner_id (name)
      `)
      .eq('cleaner_id', this.userId)
      .eq('status', 'Completed')
      .order('date', { ascending: sortOrder === 'asc' });

    if (serviceFilter) {
      query = query.eq('service', serviceFilter);
    }

    if (dateRange?.start) {
      query = query.gte('date', dateRange.start);
    }

    if (dateRange?.end) {
      query = query.lte('date', dateRange.end);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data?.map(job => {
      const homeowner = Array.isArray(job.homeowner) 
        ? job.homeowner[0] 
        : job.homeowner;
        
      return {
        ...job,
        homeowner,
        customer_name: homeowner?.name || 'Unknown'
      };
    }) || [];
  }

async fetchBookings(sortOrder: 'asc' | 'desc' = 'asc'): Promise<History[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      id,
      service,
      location,
      date,
      status,
      homeowner_id,
      homeowner:homeowner_id (name)
    `)
    .eq('cleaner_id', this.userId)
    .in('status', ['Pending', 'Approved', 'Rejected'])
    .order('date', { ascending: sortOrder === 'asc' });

  if (error) throw error;

  return data?.map(job => {
    // Handle both array and object cases for homeowner
    const homeowner = Array.isArray(job.homeowner) 
      ? job.homeowner[0] 
      : job.homeowner;
      
    return {
      ...job,
      homeowner,
      customer_name: homeowner?.name || 'Unknown'
    };
  }) || [];
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

  async reportJob(jobId: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('job_reports')
      .insert({
        job_id: jobId,
        reporter_id: this.userId,
        reason,
        reported_at: new Date().toISOString()
      });

    if (error) throw error;
  }
}
