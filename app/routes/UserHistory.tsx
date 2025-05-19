// routes/UserHistory.tsx
import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { UserHistoryController } from '../controllers/userHistoryController';


const availableServices = [
  "General Cleaning",
  "Kitchen Cleaning",
  "Bathroom Cleaning",
  "Deep Cleaning",
  "Window Cleaning",
  "Carpet Cleaning",
  "Office Cleaning",
  "Commercial Cleaning",
  "Floor Maintenance",
  "Appliance Cleaning",
  "Eco-Friendly",
  "Detailing",
  "Post-Renovation",
  "Dust Removal",
  "Glass Cleaning",
];

const completionOptions = [
  { label: 'All', value: '' },
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function GetHistory() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [serviceFilter, setServiceFilter] = useState('');
  const [completionFilter, setCompletionFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

//   const filters = [];

  const filters = useMemo(() => {
    const f: Array<{ column: string; operator: string; value: string }> = [];

    if (serviceFilter) {
      f.push({ column: 'service', operator: 'eq', value: serviceFilter });
    }
    if (completionFilter) {
      f.push({ column: 'status', operator: 'eq', value: completionFilter });
    }
    if (dateFilter) {
      f.push({
        column: 'date',
        operator: 'gte',
        value: `${dateFilter}T00:00:00`,
      });
      f.push({
        column: 'date',
        operator: 'lt',
        value: `${dateFilter}T23:59:59`,
      });
    }

    return f;
  }, [serviceFilter, completionFilter, dateFilter]);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      const history = await UserHistoryController.getHistory(
      id,
      filters
      );
      setItems(history);
      setLoading(false);
    })();
  }, [id, filters]);

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
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                  <select
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="w-full rounded-md border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Services</option>
                    {availableServices.map((svc) => (
                      <option key={svc} value={svc} className="text-black">{svc}</option>
                    ))}
                  </select>
                  <select
                    value={completionFilter}
                    onChange={(e) => setCompletionFilter(e.target.value)}
                    className="w-full rounded-md border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                  >
                    {completionOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="text-black">{opt.label}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full rounded-md border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

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
