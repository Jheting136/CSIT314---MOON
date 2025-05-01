import { Button } from '@mui/material';

export default function AdminPage() {
  const goToAdminView = () => {
    window.location.href = "/adminView"; //simple redirect
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        Welcome, Admin
      </h1>

      <Button variant="contained" color="primary" onClick={goToAdminView}>
        View List of Users
      </Button>
    </main>
  );
}
