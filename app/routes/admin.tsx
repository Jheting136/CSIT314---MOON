//admin.tsx in BCE
import { Button } from '@mui/material';
import { AdminPageController } from '../controllers/adminPageController';

export default function AdminPage() {
  const controller = new AdminPageController();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        Welcome, Admin
      </h1>

      <Button variant="contained" color="primary" onClick={controller.handleViewUsers}>
        View List of Users
      </Button>
    </main>
  );
}
