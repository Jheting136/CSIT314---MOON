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

interface CompletionModalProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

function CompletionModal({
  jobId,
  isOpen,
  onClose,
  onComplete,
}: CompletionModalProps) {
  const [includeReport, setIncludeReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await listingController.markJobCompletedWithReport(
        jobId,
        includeReport ? { reason: reportReason } : undefined
      );
      onComplete();
      onClose();
    } catch (error) {
      setError("Failed to complete job. Please try again.");
      console.error("Error completing job:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Complete Job</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeReport"
              checked={includeReport}
              onChange={(e) => setIncludeReport(e.target.checked)}
              className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
            />
            <label htmlFor="includeReport" className="text-gray-300">
              Include a job report
            </label>
          </div>

          {includeReport && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Report Details
              </label>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Describe any issues or concerns..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                rows={4}
                required={includeReport}
              />
            </div>
          )}

          {error && (
            <div className="text-red-400 bg-red-900 bg-opacity-20 p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Complete Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function JobsTab() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingJobId, setCompletingJobId] = useState<string | null>(null);

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

  const pendingJobs = jobs.filter(
    (job) => job.status === "Pending" || job.status === "Approved"
  );
  const completedJobs = jobs.filter(
    (job) =>
      job.status === "Completed" ||
      job.status === "completed" ||
      job.status === "cancelled" ||
      job.status === "Rejected"
  );

  const handleJobComplete = (jobId: string) => {
    setCompletingJobId(jobId);
  };

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
                    onClick={() => handleJobComplete(job.id)}
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

      <CompletionModal
        jobId={completingJobId || ""}
        isOpen={!!completingJobId}
        onClose={() => setCompletingJobId(null)}
        onComplete={async () => {
          await loadJobs(); // Reload jobs after completion
          setCompletingJobId(null);
        }}
      />
    </div>
  );
}
