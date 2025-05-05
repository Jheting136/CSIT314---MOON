import React, { useState } from 'react';
import { getWorkHistoryData } from '../controllers/cleanerController';
import WorkHistoryView from './workHistoryView';
import { handleLogout } from '../controllers/logoutController';

type Tab = 'workHistory' | 'portfolio' | 'availability' | 'bookings';

export default function CleanerPage() {
  const [activeTab, setActiveTab] = useState<Tab>('workHistory');
  const workHistory = getWorkHistoryData();

  const renderContent = () => {
    switch (activeTab) {
      case 'workHistory':
         return <WorkHistoryView workHistory={workHistory} />;
      case 'portfolio':
        return <div>This is your portfolio.</div>;
      case 'availability':
        return <div>Update your availability here.</div>;
      case 'bookings':
        return <div>These are your booking confirmations.</div>;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 relative">
      {/* Top-right Logout Button */}
    <div className="absolute top-6 right-6">
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
      >
        Log Out
      </button>
    </div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        Welcome, Cleaner
      </h1>

      <div className="flex justify-center mb-4 space-x-4">
        <button
          onClick={() => setActiveTab('workHistory')}
          className={`px-4 py-2 rounded ${
            activeTab === 'workHistory'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border'
          }`}
        >
          View Work History
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-4 py-2 rounded ${
            activeTab === 'portfolio'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border'
          }`}
        >
          Portfolio
        </button>
        <button
          onClick={() => setActiveTab('availability')}
          className={`px-4 py-2 rounded ${
            activeTab === 'availability'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border'
          }`}
        >
          Update Availability
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded ${
            activeTab === 'bookings'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border'
          }`}
        >
          Booking Confirmation
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        {renderContent()}
      </div>
    </main>
  );
}
