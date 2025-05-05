// views/AdminDashboard.tsx  (put under /routes if you’re routing with Vite/React-Router)
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AdminApproveController } from '../controllers/adminApproveController';
import { handleLogout } from '../controllers/logoutController';

type View = 'userList' | 'cleanerRequests';

export default function AdminDashboard() {
  const nav = useNavigate();
  const ctrl = new AdminApproveController();

  const [currentView, setCurrentView] = useState<View>('cleanerRequests');
  const [requests, setRequests] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  /** initial & refresh */
  const load = async () => {
    setLoading(true);
    setRequests(await ctrl.list());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const decide = async (id: string, s: 'approved' | 'rejected') => {
    const ok = s === 'approved' ? await ctrl.approve(id) : await ctrl.reject(id);
    if (ok) load();
  };

  /* --------------------------------------- UI --------------------------------------------------- */
  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
      {/* ░░ Sidebar ░░ */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col p-6">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

        <button
          onClick={() => { setCurrentView('userList'); nav('/adminView'); }}
          className={`mb-3 px-4 py-2 rounded ${
            currentView === 'userList'
              ? 'bg-blue-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          View User List
        </button>

        <button
          onClick={() => setCurrentView('cleanerRequests')}
          className={`mb-3 px-4 py-2 rounded ${
            currentView === 'cleanerRequests'
              ? 'bg-blue-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          View Cleaner Applications
        </button>

        <button
          onClick={handleLogout}
          className="mt-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Log Out
        </button>
      </aside>

      {/* ░░ Main panel ░░ */}
      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-6">Welcome, Admin</h1>

        {currentView === 'cleanerRequests' && (
          <>
            <h2 className="text-2xl font-semibold mb-4">
              Pending Cleaner Requests
            </h2>

            {loading && <p className="italic text-gray-500">Loading…</p>}

            {!loading && requests.length === 0 && (
              <p className="italic text-gray-500">No pending applications 🎉</p>
            )}

            {requests.map((u) => (
              <div
                key={u.id}
                className="bg-white dark:bg-gray-800 p-6 mb-4 rounded shadow"
              >
                <p>
                  <strong>Name:</strong> {u.name}
                </p>
                <p>
                  <strong>Email:</strong> {u.email}
                </p>
                <p>
                  <strong>Status:</strong> {u.status}
                </p>

                {u.status === 'pending' && (
                  <div className="mt-3 space-x-2">
                    <button
                      onClick={() => decide(u.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => decide(u.id, 'rejected')}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}
