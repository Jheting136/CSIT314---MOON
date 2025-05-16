import { listingModel, type CleanerListing } from '../models/listingModel';

export class listingController {
  static async getListings(
    filters?: { column: string; operator: string; value: any }[],
  ): Promise<{ data: CleanerListing[]; count: number }> {
    return await listingModel.fetchListings(filters);
  }
}
