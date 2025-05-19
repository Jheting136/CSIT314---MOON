import { getHistory, type HistoryItem } from '../models/userHistoryModel';

export class UserHistoryController {
  static async getHistory(id: string, filters: Array<{ column: string; operator: string; value: string }>): Promise<history[]> {
    return await getHistory(id,filters);
  }
}

// import { fetchHistoryByUser, type HistoryItem } from '../models/userHistoryModel';
//
// export class UserHistoryController {
//   static async list(userId: string): Promise<HistoryItem[]> {
//     return await fetchHistoryByUser(userId);
//   }
// }
