import { handleLogout } from '../controllers/logoutController';

export default function HomeownerPage() {
  return (
    <main className="min-h-screen relative flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
      {/* Top-right Logout Button */}
      <div className="absolute top-6 right-6">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Log Out
        </button>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        Welcome, Homeowner 
      </h1>
    </main>
  );
}
