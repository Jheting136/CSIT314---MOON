import { commonModel } from '../models/commonModel';

export class adminViewController {
  static async deleteUser(
    id: string,
    table: string = 'users'
  ): Promise<any[]> {
    return await commonModel.deleteUser(table, id);
  }
}