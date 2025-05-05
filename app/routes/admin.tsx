import { Button } from '@mui/material';
import { AdminPageController } from '../controllers/adminPageController';
import { handleLogout } from '../controllers/logoutController';

export default function AdminPage() {
  const controller = new AdminPageController();

  return (
    <main className="min-h-screen relative bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center px-4">
      {/* Top-right Logout Button */}
      <div className="absolute top-6 right-6">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Log Out
        </button>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        Welcome, Admin
      </h1>

      <Button variant="contained" color="primary" onClick={controller.handleViewUsers}>
        View List of Users
      </Button>
    </main>
  );
}
