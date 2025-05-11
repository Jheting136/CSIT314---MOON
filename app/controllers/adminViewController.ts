import { commonModel } from '../models/commonModel';
import { adminModel } from '../models/adminModel'

export class adminViewController {
  static async deleteUser(
    id: string,
    table: string = 'users'
  ): Promise<any[]> {
    return await commonModel.deleteUser(table, id);
  }

  static async approveUser(id: string): Promise<any[]> {
    return await adminModel.approveUser(id);
  }

  static async rejectUser(id: string): Promise<any[]> {
    return await adminModel.rejectUser(id);
  }
}