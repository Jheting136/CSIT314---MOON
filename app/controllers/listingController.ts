import { listingModel } from "../models/listingModel";
import type {
  CleanerFilterOptions,
  FilteredCleanersResult,
  CleaningService,
} from "../models/listingModel";

export type { CleanerFilterOptions, FilteredCleanersResult, CleaningService };

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

  static async saveView(cleanerId: string): Promise<void> {
    try {
      const viewerId = localStorage.getItem("userId");
      if (!viewerId) {
        throw new Error("User ID not found");
      }

      await listingModel.saveView(cleanerId, viewerId);
    } catch (error) {
      console.error("[ListingController] Error in saveView:", error);
      throw error instanceof Error
        ? error
        : new Error("An unexpected error occurred while saving view");
    }
  }

  static async saveFavorite(
    cleanerId: string,
    userId: string,
    isFavorite: boolean
  ): Promise<void> {
    try {
      await listingModel.saveFavorite(cleanerId, userId, isFavorite);
    } catch (error) {
      console.error("[ListingController] Error in saveFavorite:", error);
      throw error instanceof Error
        ? error
        : new Error(
            "An unexpected error occurred while updating favorite status"
          );
    }
  }

  static async getFavorites(userId: string): Promise<string[]> {
    try {
      return await listingModel.getFavorites(userId);
    } catch (error) {
      console.error("[ListingController] Error in getFavorites:", error);
      throw error instanceof Error
        ? error
        : new Error("An unexpected error occurred while fetching favorites");
    }
  }

  static async createBooking(
    cleanerId: string,
    service: string,
    location: string,
    date: Date
  ): Promise<string> {
    try {
      const homeownerId = localStorage.getItem("userId");
      if (!homeownerId) {
        throw new Error("User ID not found");
      }

      return await listingModel.createBooking(
        cleanerId,
        homeownerId,
        service,
        location,
        date
      );
    } catch (error) {
      console.error("[ListingController] Error in createBooking:", error);
      throw error instanceof Error
        ? error
        : new Error("An unexpected error occurred while creating the booking");
    }
  }
}
