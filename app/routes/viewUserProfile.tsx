// routes/viewUserProfile.tsx  (Boundary)
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { fetchUserById } from '../controllers/viewUserProfileController';

export default function ViewUserProfile() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setUser(await fetchUserById(id!));
      setLoading(false);
    })();
  }, [id]);

  /* ---------- UI ---------------------------------------------------------------------- */
  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center items-start p-6">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 p-10">
        {/* 🔙 Back */}
        <button
          onClick={() => nav(-1)}
          className="mb-6 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <span aria-hidden>←</span> Back
        </button>

        {/* Header */}
        <header className="flex items-center gap-6 mb-8">
          {/* Avatar (initial) */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>

          <h1 className="text-3xl font-black text-gray-800 dark:text-white">
            User&nbsp;Profile
          </h1>
        </header>

        {/* States */}
        {loading && (
          <p className="text-gray-500 dark:text-gray-400">Loading…</p>
        )}

        {!loading && !user && (
          <p className="text-red-600 dark:text-red-400">User not found.</p>
        )}

       {/* Profile details */}
          {!loading && user && (
            <>
              <section className="grid sm:grid-cols-2 gap-6 text-gray-800 dark:text-gray-100">
                <Info label="Name"   value={user.name} />
                <Info label="Email"  value={user.email} />
                <Info label="Role"   value={capitalize(user.account_type)} />
                <Info label="Joined" value={new Date(user.created_at).toLocaleDateString()} />
              </section>

              {/* View History button  */}
              <button
                onClick={() => nav(`/userHistory/${id}`)}
                className="mt-8 inline-flex items-center gap-1 px-5 py-2.5 rounded-lg
                          bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                View&nbsp;History
              </button>
            </>
          )}
      </div>
    </main>
  );
}

/* ---------- Helpers ---------- */
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="text-lg font-medium break-all">{value}</p>
    </div>
  );
}

const capitalize = (s: string) => s.slice(0, 1).toUpperCase() + s.slice(1);
