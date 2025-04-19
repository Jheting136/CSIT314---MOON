import { getAllListings } from "../models/listingModel";
import type { CleaningService } from "../models/listingModel";

export const fetchListings = async (): Promise<CleaningService[]> => {
  try {
    const data = await getAllListings();
    return data;
  } catch (error) {
    console.error("Failed to fetch listings", error);
    return [];
  }
};
