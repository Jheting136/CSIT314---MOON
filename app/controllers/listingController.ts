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
    console.log('[listingController] fetchAndFilterCleaners called with options:', options);
    const {
      searchTerm = '',
      minPrice = '',
      maxPrice = '',
      minRating = 0,
      selectedService = '',
      page = 1,
      pageSize = 6,
    } = options;

    let query = supabase
      .from('users')
      .select(
        'id, name, email, rates, bio, location, services_offered, average_rating, created_at',
        { count: 'exact' }
      )
      .eq('account_type', 'cleaner')
      .eq('status', 'active');

    if (searchTerm) {
      console.log(`[listingController] Applying searchTerm filter: ${searchTerm}`);
      query = query.or(`name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`);
    }
    if (minPrice !== '') {
      console.log(`[listingController] Applying minPrice filter: ${minPrice}`);
      query = query.gte('rates', minPrice);
    }
    if (maxPrice !== '') {
      console.log(`[listingController] Applying maxPrice filter: ${maxPrice}`);
      query = query.lte('rates', maxPrice);
    }
    if (selectedService) {
      console.log(`[listingController] Applying selectedService filter: ${selectedService}`);
      // Corrected line: Use .contains() for array columns
      // The second argument should be an array of values to check for containment.
      // Since selectedService is a single string, we wrap it in an array.
      query = query.contains('services_offered', [selectedService]);
    }
    if (minRating > 0) {
      console.log(`[listingController] Applying minRating filter: ${minRating}`);
      query = query.gte('average_rating', minRating);
    }

    const offset = (page - 1) * pageSize;
    query = query.range(offset, offset + pageSize - 1);
    query = query.order('average_rating', { ascending: false, nullsFirst: false })
                 .order('name', { ascending: true });

    console.log('[listingController] Executing Supabase query...');
    const { data: usersData, error, count } = await query;

    if (error) {
      console.error("[listingController] Error fetching cleaners from Supabase:", error);
      // It's important to throw the error so the calling function (in homeowner.tsx) can catch it.
      throw new Error(`Failed to fetch cleaners: ${error.message}`);
    }

    console.log('[listingController] Supabase raw usersData:', usersData);
    console.log('[listingController] Supabase count:', count);

    if (!usersData) {
      console.warn('[listingController] No usersData received from Supabase, returning empty result.');
      return { data: [], totalCount: 0 };
    }

    const cleaners: CleaningService[] = usersData.map((user: any) => ({
      id: user.id,
      title: `${user.name}'s Cleaning Services`,
      description: user.bio || 'Experienced and reliable cleaner.',
      price: user.rates || 0,
      provider: user.name,
      location: user.location || 'Service area not specified',
      rating: user.average_rating || 0,
      services: user.services_offered || [],
    }));

    console.log('[listingController] Mapped cleaners:', cleaners);

    return {
      data: cleaners,
      totalCount: count || 0,
    };
  }
}
