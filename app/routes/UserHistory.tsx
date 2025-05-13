// routes/UserHistory.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { UserHistoryController } from '../controllers/userHistoryController';

export default function GetHistory() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      const history = await UserHistoryController.getHistory(id);
      setItems(history);
      setLoading(false);
    })();
  }, [id]);

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center p-6">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 p-8">
        <button
          onClick={() => nav(-1)}
          className="mb-6 text-sm text-blue-600 hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
          User History
        </h1>

        {loading && <p className="text-gray-500">Loading…</p>}

        {!loading && items.length === 0 && (
          <p className="italic text-gray-500">No records found.</p>
        )}

        <ul className="space-y-4">
          {items.map((j, index) => (
            <li
              key={j.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div>
                <p className="font-medium">{j.service}</p>
                <p className="text-sm text-gray-500">{j.location}</p>
              </div>
              <div className="text-sm text-right">
                <p>{new Date(j.date).toLocaleDateString()}</p>
                <p className="capitalize">{j.status}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
