import { commonModel } from './commonModel';

export class adminModel {

  static async approveUser(id: string): Promise<boolean> {
      return await commonModel.setUserStatus('users', id, 'status', 'active');
    }

    static async rejectUser(id: string): Promise<boolean> {
      return await commonModel.setUserStatus('users', id, 'status', 'rejected');
    }
}
