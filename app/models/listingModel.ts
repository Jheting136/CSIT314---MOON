import { commonModel } from "./commonModel";

export interface CleaningService {
  id: string;
  provider: string;
  title?: string;
  description?: string;
  price: number;
  rating: number;
  location: string;
  services: string[];
}

export interface CleanerFilterOptions {
  searchTerm?: string;
  minPrice?: number | "";
  maxPrice?: number | "";
  minRating: number;
  selectedService?: string;
  page: number;
  pageSize: number;
}

export interface FilteredCleanersResult {
  data: CleaningService[];
  totalCount: number;
}

export interface DatabaseResponse {
  data: any[];
  count: number;
}

export class listingModel {
  static async fetchFilteredCleaners(
    options: CleanerFilterOptions
  ): Promise<FilteredCleanersResult> {
    const filters = this.buildFilters(options);
    try {
      // Select fields without aliases
      const fields = `
        id,
        name,
        bio,
        rates,
        average_rating,
        location,
        services_offered
      `;

      const rawResponse = await commonModel.getData(
        "users",
        fields.trim(),
        filters,
        options.page,
        options.pageSize
      );

      if (!this.isDatabaseResponse(rawResponse)) {
        throw new Error("Invalid response format from database");
      }

      const transformedData = rawResponse.data.map((item: any) => ({
        id: item.id,
        provider: item.name || "",
        description: item.bio || "",
        price: Number(item.rates) || 0,
        rating: Number(item.average_rating) || 0,
        location: item.location || "",
        services: Array.isArray(item.services_offered)
          ? item.services_offered
          : [],
      }));

      return {
        data: transformedData,
        totalCount: rawResponse.count,
      };
    } catch (error) {
      console.error("[ListingModel] Error fetching cleaners:", error);
      throw new Error("Failed to fetch cleaner listings");
    }
  }

  private static isDatabaseResponse(
    response: unknown
  ): response is DatabaseResponse {
    return (
      typeof response === "object" &&
      response !== null &&
      "data" in response &&
      "count" in response &&
      Array.isArray((response as DatabaseResponse).data)
    );
  }

  private static buildFilters(options: CleanerFilterOptions) {
    const filters: { column: string; operator: string; value: any }[] = [
      { column: "account_type", operator: "eq", value: "cleaner" },
      { column: "status", operator: "eq", value: "active" },
    ];

    if (options.searchTerm) {
      filters.push({
        column: "name",
        operator: "ilike",
        value: `%${options.searchTerm}%`,
      });
    }

    if (options.minPrice !== undefined && options.minPrice !== "") {
      filters.push({
        column: "rates",
        operator: "gte",
        value: options.minPrice,
      });
    }

    if (options.maxPrice !== undefined && options.maxPrice !== "") {
      filters.push({
        column: "rates",
        operator: "lte",
        value: options.maxPrice,
      });
    }

    if (options.minRating > 0) {
      filters.push({
        column: "average_rating",
        operator: "gte",
        value: options.minRating,
      });
    }

    // Modified filter for services_offered array column
    if (options.selectedService) {
      filters.push({
        column: "services_offered",
        operator: "cs", // cs operator for array contains in PostgreSQL
        value: `{${options.selectedService}}`, // Wrap the service in curly braces for array literal
      });
    }

    return filters;
  }

  static async saveView(cleanerId: string, viewerId: string): Promise<void> {
    try {
      // Direct database call using commonModel
      await commonModel.insertData("cleaner_views", {
        cleaner_id: cleanerId,
        viewer_id: viewerId,
        // viewed_at has a default of now() in the database, so no need to specify it
      });
    } catch (error) {
      console.error("[ListingModel] Error saving view:", error);
      throw error;
    }
  }

  static async saveFavorite(
    cleanerId: string,
    userId: string,
    isFavorite: boolean
  ): Promise<void> {
    try {
      const favoriteExists = await commonModel.recordExists(
        "cleaner_favorites",
        {
          cleaner_id: cleanerId,
          user_id: userId,
        }
      );

      if (isFavorite && !favoriteExists) {
        // Add to favorites
        await commonModel.insertData("cleaner_favorites", {
          cleaner_id: cleanerId,
          user_id: userId,
          // created_at has a default of now() in the database
        });
      } else if (!isFavorite && favoriteExists) {
        // Remove from favorites
        await commonModel.deleteRecord("cleaner_favorites", {
          cleaner_id: cleanerId,
          user_id: userId,
        });
      }
      // If already in desired state, do nothing
    } catch (error) {
      console.error("[ListingModel] Error updating favorite status:", error);
      throw error instanceof Error
        ? error
        : new Error(
            "An unexpected error occurred while updating favorite status"
          );
    }
  }

  static async getFavorites(userId: string): Promise<string[]> {
    try {
      const favorites = await commonModel.getRecords(
        "cleaner_favorites",
        "cleaner_id",
        { user_id: userId }
      );

      // Extract cleaner_id values from the results
      return favorites.map((favorite) => favorite.cleaner_id);
    } catch (error) {
      console.error("[ListingModel] Error fetching favorites:", error);
      throw error instanceof Error
        ? error
        : new Error("An unexpected error occurred while fetching favorites");
    }
  }

  static async isFavorited(
    cleanerId: string,
    userId: string
  ): Promise<boolean> {
    try {
      return await commonModel.recordExists("cleaner_favorites", {
        cleaner_id: cleanerId,
        user_id: userId,
      });
    } catch (error) {
      console.error("[ListingModel] Error checking favorite status:", error);
      throw error instanceof Error
        ? error
        : new Error(
            "An unexpected error occurred while checking favorite status"
          );
    }
  }

  static async createBooking(
    cleanerId: string,
    homeownerId: string,
    service: string,
    location: string,
    date: Date
  ): Promise<string> {
    try {
      const booking = await commonModel.insertData("jobs", {
        cleaner_id: cleanerId,
        homeowner_id: homeownerId,
        service: service,
        location: location,
        date: date,
        status: "pending", // Initial status
      });

      return booking.id;
    } catch (error) {
      console.error("[ListingModel] Error creating booking:", error);
      throw error instanceof Error
        ? error
        : new Error("An unexpected error occurred while creating the booking");
    }
  }
}
