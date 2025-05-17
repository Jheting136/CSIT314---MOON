import { accountModel } from "../models/accountModel";

export interface UpdateProfileData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export class accountController {
  static async getCurrentUser() {
    try {
      return await accountModel.getCurrentUser();
    } catch (error) {
      console.error("[AccountController] Error getting current user:", error);
      throw error;
    }
  }

  static async updateUserProfile(data: UpdateProfileData) {
    try {
      // Validate input
      if (data.newPassword && !data.currentPassword) {
        throw new Error("Current password is required to set new password");
      }

      // If changing password, verify current password first
      if (data.currentPassword) {
        const isValid = await accountModel.verifyPassword(data.currentPassword);
        if (!isValid) {
          throw new Error("Current password is incorrect");
        }
      }

      // Update profile
      return await accountModel.updateProfile(data);
    } catch (error) {
      console.error("[AccountController] Error updating profile:", error);
      throw error;
    }
  }
}
