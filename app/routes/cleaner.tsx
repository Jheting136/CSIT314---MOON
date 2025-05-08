import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { UserHistoryController } from '../controllers/userHistoryController';
import { handleLogout } from '../controllers/logoutController';
import { type HistoryItem } from '../models/userHistoryModel';

const CleanerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'Work Completed' | 'portfolio' | 'availability' | 'bookings'>('profile');
  const [jobs, setJobs] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'Work Completed') {
      fetchCompletedJobs();
    } else if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab]);

  // Fetch only completed jobs for Work tab
  const fetchCompletedJobs = async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError('Failed to get authenticated user');
      console.error('Auth error:', userError?.message);
      setLoading(false);
      return;
    }

    try {
      const jobHistory = await UserHistoryController.list(user.id);
      const completedJobs = jobHistory.filter(
        (job) => job.status.toLowerCase() === 'completed'
      );
      setJobs(completedJobs);
    } catch (err) {
      console.error('Controller error:', err);
      setError('Failed to fetch completed jobs.');
    }

    setLoading(false);
  };

  // Fetch pending, approved, and rejected jobs for Bookings tab
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError('Failed to get authenticated user');
      console.error('Auth error:', userError?.message);
      setLoading(false);
      return;
    }

    try {
      const jobHistory = await UserHistoryController.list(user.id);
      const filtered = jobHistory.filter(
        (job) =>
          ['pending', 'approved', 'rejected'].includes(job.status.toLowerCase())
      );
      setJobs(filtered);
    } catch (err) {
      console.error('Controller error:', err);
      setError('Failed to fetch bookings.');
    }

    setLoading(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <div>Cleaner profile info goes here.</div>;

      case 'Work Completed':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Completed Work</h2>
            {loading ? (
              <p>Loading completed jobs...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : jobs.length === 0 ? (
              <p>No completed jobs found.</p>
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
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Bookings</h2>
            {loading ? (
              <p>Loading bookings...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : jobs.length === 0 ? (
              <p>No bookings found.</p>
            ) : (
              <ul className="space-y-4">
                {jobs.map((job) => (
                  <li key={job.id} className="p-4 border rounded shadow">
                    <p><strong>Service:</strong> {job.service}</p>
                    <p><strong>Location:</strong> {job.location}</p>
                    <p><strong>Date:</strong> {new Date(job.date).toLocaleString()}</p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span
                        className={
                          job.status.toLowerCase() === 'approved'
                            ? 'text-green-600'
                            : job.status.toLowerCase() === 'rejected'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                        }
                      >
                        {job.status}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cleaner Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="flex space-x-4 mb-6">
        {['profile', 'Work Completed', 'portfolio', 'availability', 'bookings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div>{renderTabContent()}</div>
    </div>
  );
};

export default CleanerPage;
