import { getAllListings } from "../models/listingModel";
import type { CleaningService } from "../models/listingModel";

import { commonModel } from '../models/commonModel';

export class listingController {
  static async getData(
    table: string,
    columns: string,
    filters?: { column: string, operator: string, value: any }[],
    page: number,
    pageSize: number
  ): Promise<any[]> {
    return await commonModel.getData(table, columns, filters, page, pageSize);
  }
}

// export const fetchListings = async (): Promise<CleaningService[]> => {
//   try {
//     const data = await getAllListings();
//     return data;
//   } catch (error) {
//     console.error("Failed to fetch listings", error);
//     return [];
//   }
// };
