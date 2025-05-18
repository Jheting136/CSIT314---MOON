import React, { useState, useEffect } from "react";
import { accountController } from "../controllers/accountController";

export default function ManageAccount() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    hourlyRate: "",
  });
  const [message, setMessage] = useState({ type: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    // Load current user data
    const loadUserData = async () => {
      try {
        const userData = await accountController.getCurrentUser();
        setFormData((prev) => ({
          ...prev,
          name: userData.name || "",
          email: userData.email || "",
          hourlyRate: userData.hourlyRate?.toString() || "",
        }));

        const userType = localStorage.getItem("userType");
        setUserType(userType);
      } catch (error) {
        setMessage({ type: "error", content: "Failed to load user data" });
      }
    };
    loadUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.name === "hourlyRate"
        ? e.target.value.replace(/[^\d.]/g, "") // Only allow numbers and decimal point
        : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", content: "" });

    try {
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error("New passwords do not match");
        }
        if (!formData.currentPassword) {
          throw new Error("Current password is required to set new password");
        }
      }

      await accountController.updateUserProfile({
        name: formData.name,
        email: formData.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        hourlyRate: formData.hourlyRate
          ? parseFloat(formData.hourlyRate)
          : undefined,
      });

      setMessage({ type: "success", content: "Profile updated successfully" });
      // Clear password fields after successful update
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      setTimeout(() => {
        window.location.href = "/" + userType;
      }, 1500); // Give user time to see success message
    } catch (error) {
      setMessage({
        type: "error",
        content:
          error instanceof Error ? error.message : "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Manage Account</h1>

        {message.content && (
          <div
            className={`p-4 rounded mb-6 ${
              message.type === "error"
                ? "bg-red-600/20 text-red-200"
                : "bg-green-600/20 text-green-200"
            }`}
          >
            {message.content}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {userType === "cleaner" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hourly Rate ($)
              </label>
              <input
                type="text"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="pt-6 border-t border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex-1 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
