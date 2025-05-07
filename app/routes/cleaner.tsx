import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Job {
  id: string;
  service: string;
  location: string;
  date: string;
  status: string;
}

const CleanerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'work' | 'portfolio' | 'availability' | 'bookings'>('profile');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'work') {
      fetchJobs();
    }
  }, [activeTab]);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setError('Failed to get authenticated user');
      console.error('Auth error:', userError.message);
      setLoading(false);
      return;
    }

    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    const { data, error: jobsError } = await supabase
      .from('jobs')
      .select('id, service, location, date, status')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (jobsError) {
      setError('Error fetching jobs: ' + jobsError.message);
      console.error(jobsError);
    } else {
      setJobs(data || []);
    }

    setLoading(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <div>Cleaner profile info goes here.</div>;

      case 'work':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Work History</h2>
            {loading ? (
              <p>Loading work history...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : jobs.length === 0 ? (
              <p>No work history found.</p>
            ) : (
              <ul className="space-y-4">
                {jobs.map((job) => (
                  <li key={job.id} className="p-4 border rounded shadow">
                    <p><strong>Service:</strong> {job.service}</p>
                    <p><strong>Location:</strong> {job.location}</p>
                    <p><strong>Date:</strong> {new Date(job.date).toLocaleString()}</p>
                    <p><strong>Status:</strong> {job.status}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );

      case 'portfolio':
        return <div>Portfolio content goes here.</div>;

      case 'availability':
        return <div>Availability settings go here.</div>;

      case 'bookings':
        return <div>Upcoming and past bookings go here.</div>;

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Cleaner Dashboard</h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded ${activeTab === 'profile' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('work')}
          className={`px-4 py-2 rounded ${activeTab === 'work' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Work History
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-4 py-2 rounded ${activeTab === 'portfolio' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Portfolio
        </button>
        <button
          onClick={() => setActiveTab('availability')}
          className={`px-4 py-2 rounded ${activeTab === 'availability' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Availability
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded ${activeTab === 'bookings' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Bookings
        </button>
      </div>

      <div>{renderTabContent()}</div>
    </div>
  );
};

export default CleanerPage;
