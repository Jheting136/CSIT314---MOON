import { listingModel } from "../models/listingModel";
import type {
  CleanerFilterOptions,
  FilteredCleanersResult,
} from "../models/listingModel";

export class listingController {
  static async fetchAndFilterCleaners(
    options: CleanerFilterOptions
  ): Promise<FilteredCleanersResult> {
    try {
      const result = await listingModel.fetchFilteredCleaners(options);

      if (!result.data || !Array.isArray(result.data)) {
        throw new Error("Invalid data format received from database");
      }

      return {
        data: result.data,
        totalCount: result.totalCount,
      };
    } catch (error) {
      console.error(
        "[ListingController] Error in fetchAndFilterCleaners:",
        error
      );
      throw error instanceof Error
        ? error
        : new Error("An unexpected error occurred while fetching cleaners");
    }
  }
}
