import { commonModel } from './commonModel';

export interface CleanerListing {
  id: string;
  name: string;
  rates: number;
  location: string;
  average_rating: number;
  services_offered: string;
}

export class listingModel {
  static async fetchListings(
    additionalFilters: { column: string; operator: string; value: any }[] | null = null,
    page = 1,
    pageSize = 12
  ): Promise<{ data: CleanerListing[]; count: number }> {
    // Base filters to ensure we only get active cleaners
    const baseFilters = [
      { column: 'account_type', operator: 'eq', value: 'cleaner' },
      { column: 'status', operator: 'eq', value: 'active' }
    ];

    // Merge base filters with any additional filters (if provided)
    const allFilters = additionalFilters ? [...baseFilters, ...additionalFilters] : baseFilters;

    // Query the users table
    const { data, count, error } = await commonModel.getData(
      'users',
      'id, name, rates, location, average_rating, services_offered',
      allFilters,
      page,
      pageSize
    );

    if (error || !data) {
      throw new Error('Failed to fetch cleaner listings.');
    }

    return {
      data: data as CleanerListing[],
      count
    };
  }
}