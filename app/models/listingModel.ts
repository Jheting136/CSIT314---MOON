// Full Code/app/controllers/listingController.ts
import { supabase } from '../lib/supabaseClient';
import type { CleaningService } from '../models/listingModel'; // For the return type structure

export interface CleanerFilterOptions {
  searchTerm?: string;
  minPrice?: number | '';
  maxPrice?: number | '';
  minRating?: number;
  selectedService?: string;
  page?: number;
  pageSize?: number;
}

export interface FilteredCleanersResult {
  data: CleaningService[];
  totalCount: number;
}

export class listingController {
  static async fetchAndFilterCleaners(
    options: CleanerFilterOptions
  ): Promise<FilteredCleanersResult> {
    const {
      searchTerm = '',
      minPrice = '',
      maxPrice = '',
      minRating = 0, // Now we can filter by this directly
      selectedService = '',
      page = 1,
      pageSize = 6,
    } = options;

    // Start building the Supabase query
    let query = supabase
      .from('users') // Querying the 'users' table
      .select(
        'id, name, email, rates, bio, location, services_offered, average_rating, created_at', // Select new columns
        { count: 'exact' } // Get the total count of matching records
      )
      .eq('account_type', 'cleaner') // Filter for users who are cleaners
      .eq('status', 'active'); // Filter for active/approved cleaners

    // Apply search term filter (searches in name and bio)
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`);
    }

    // Apply price filters (on the 'rates' column)
    if (minPrice !== '') {
      query = query.gte('rates', minPrice);
    }
    if (maxPrice !== '') {
      query = query.lte('rates', maxPrice);
    }

    // Apply service filter (on the 'services_offered' array column)
    if (selectedService) {
      // 'cs' operator means 'contains' for arrays.
      // The value should be in the format '{service_name}' for a single service.
      query = query.cs('services_offered', `{${selectedService}}`);
    }

    // Apply minimum rating filter (on the 'average_rating' column)
    if (minRating > 0) {
      query = query.gte('average_rating', minRating);
    }

    // Apply pagination
    const offset = (page - 1) * pageSize;
    query = query.range(offset, offset + pageSize - 1);

    // Optionally, add default ordering
    query = query.order('average_rating', { ascending: false, nullsFirst: false })
                 .order('name', { ascending: true });


    // Execute the query
    const { data: usersData, error, count } = await query;

    if (error) {
      console.error("Error fetching cleaners from Supabase:", error);
      throw new Error(`Failed to fetch cleaners: ${error.message}`);
    }

    if (!usersData) {
      return { data: [], totalCount: 0 };
    }

    // Map the fetched user data to the CleaningService interface
    const cleaners: CleaningService[] = usersData.map((user: any) => ({
      id: user.id,
      title: `${user.name}'s Cleaning Services`, // You can customize this title
      description: user.bio || 'Experienced and reliable cleaner.',
      price: user.rates || 0,
      provider: user.name,
      location: user.location || 'Service area not specified', // From the new 'location' column
      rating: user.average_rating || 0, // From the new 'average_rating' column
      services: user.services_offered || [], // From the new 'services_offered' array column
    }));

    return {
      data: cleaners,
      totalCount: count || 0, // Total count of cleaners matching all filters
    };
  }
}
