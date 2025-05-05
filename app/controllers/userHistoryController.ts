// controllers/userHistoryController.ts
import { fetchHistoryByUser, type HistoryItem } from '../models/userHistoryModel';

export class UserHistoryController {
  static async list(userId: string): Promise<HistoryItem[]> {
    return await fetchHistoryByUser(userId);
  }
}
