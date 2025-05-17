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
}
