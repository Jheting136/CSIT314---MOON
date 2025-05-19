import React, { useState, useEffect } from "react";
import { listingController } from "../controllers/listingController";

interface Job {
  id: string;
  service: string;
  location: string;
  date: string;
  status: string;
  rating: number | null;
  users: {
    name: string;
  };
}

export function JobsTab() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("User ID not found");

      const jobsData = await listingController.getJobs(userId);
      setJobs(jobsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (jobId: string) => {
    try {
      await listingController.markJobCompleted(jobId);
      await loadJobs(); // Reload jobs after updating
    } catch (error) {
      setError("Failed to update job status");
    }
  };

  if (loading) return <div className="text-center py-8">Loading jobs...</div>;
  if (error)
    return <div className="text-red-500 text-center py-8">{error}</div>;

  const pendingJobs = jobs.filter((job) => job.status === "pending");
  const completedJobs = jobs.filter((job) => job.status === "completed");

  return (
    <div className="space-y-8">
      {/* Pending Jobs Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Pending Jobs</h2>
        {pendingJobs.length === 0 ? (
          <p className="text-gray-400">No pending jobs</p>
        ) : (
          <div className="grid gap-4">
            {pendingJobs.map((job) => (
              <div key={job.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{job.service}</h3>
                    <p className="text-gray-400">{job.users.name}</p>
                    <p className="text-sm text-gray-400">{job.location}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(job.date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleMarkCompleted(job.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    Mark Completed
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Jobs Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Job History</h2>
        {completedJobs.length === 0 ? (
          <p className="text-gray-400">No completed jobs</p>
        ) : (
          <div className="grid gap-4">
            {completedJobs.map((job) => (
              <div key={job.id} className="bg-gray-800 rounded-lg p-4">
                <div>
                  <h3 className="font-semibold">{job.service}</h3>
                  <p className="text-gray-400">{job.users.name}</p>
                  <p className="text-sm text-gray-400">{job.location}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(job.date).toLocaleDateString()}
                  </p>
                  {job.rating && (
                    <div className="mt-2">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1">{job.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
