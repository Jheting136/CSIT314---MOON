import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { UserHistoryController } from '../controllers/userHistoryController';
import { handleLogout } from '../controllers/logoutController';
import { PortfolioController } from '../controllers/portfolioController';  // Import PortfolioController
import { PortfolioImage } from '../models/portfolioImage';  // Import PortfolioImage model
import { type HistoryItem } from '../models/userHistoryModel';

const CleanerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'Work Completed' | 'portfolio' | 'availability' | 'bookings'>('profile');
  const [jobs, setJobs] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);

  // Fetch the data when the active tab changes
  useEffect(() => {
    if (activeTab === 'Work Completed') {
      fetchCompletedJobs();
    } else if (activeTab === 'bookings') {
      fetchBookings();
    } else if (activeTab === 'portfolio') {
      fetchPortfolioImages();
    }
  }, [activeTab]);

  // Fetch completed jobs for 'Work Completed' tab
  const fetchCompletedJobs = async () => {
    setLoading(true);
    setError(null);

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setError('Failed to get authenticated user');
      setLoading(false);
      return;
    }

    try {
      const jobHistory = await UserHistoryController.list(user.id);
      const completedJobs = jobHistory.filter((job) => job.status.toLowerCase() === 'completed');
      setJobs(completedJobs);
    } catch (err) {
      setError('Failed to fetch completed jobs.');
    }

    setLoading(false);
  };

  // Fetch bookings for 'bookings' tab
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setError('Failed to get authenticated user');
      setLoading(false);
      return;
    }

    try {
      const jobHistory = await UserHistoryController.list(user.id);
      const filtered = jobHistory.filter((job) =>
        ['pending', 'approved', 'rejected'].includes(job.status.toLowerCase())
      );
      setJobs(filtered);
    } catch (err) {
      setError('Failed to fetch bookings.');
    }

    setLoading(false);
  };

  // Handle file selection for image upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  // Handle file upload to portfolio
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    // Validate file type (only images allowed)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Invalid file type. Please select an image file.');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSize) {
      alert('File size is too large. Please select a file smaller than 5MB.');
      return;
    }

    setUploading(true);

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      alert('User not authenticated');
      setUploading(false);
      return;
    }

    try {
      const uploadedImage = await PortfolioController.uploadImage(user.id, selectedFile);  // Use PortfolioController
      setPortfolioImages((prevImages) => [...prevImages, uploadedImage]);
      alert('Upload successful!');
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed due to an unexpected error.');
    }

    setUploading(false);
    setSelectedFile(null);
  };

  // Handle image deletion from portfolio
  const handleDeleteImage = async (image: PortfolioImage) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      alert('User not authenticated');
      return;
    }

    try {
      await PortfolioController.deleteImage(user.id, image.id);  // Use PortfolioController
      setPortfolioImages((prevImages) => prevImages.filter((img) => img.id !== image.id));
      alert('Image deleted successfully!');
    } catch (err) {
      console.error('Delete error:', err);
      alert('An error occurred while deleting the image.');
    }
  };

  // Fetch portfolio images
  const fetchPortfolioImages = async () => {
    setLoading(true);
    setError(null);

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setError('Failed to get authenticated user');
      setLoading(false);
      return;
    }

    try {
      const images = await PortfolioController.fetchImages(user.id);  // Use PortfolioController
      setPortfolioImages(images);
    } catch (err) {
      setError('Failed to fetch portfolio images.');
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
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Portfolio</h2>
            <div className="flex items-center mb-4">
              <label className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer mr-2">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              {selectedFile && (
                <span className="ml-2">{selectedFile.name}</span>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {portfolioImages.map((image, idx) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.publicUrl}
                    alt={`Portfolio ${idx}`}
                    className="w-full h-48 object-cover rounded shadow"
                  />
                  <button
                    onClick={() => handleDeleteImage(image)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

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
                    <p><strong>Status:</strong> {job.status}</p>
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
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-blue-600 p-4 text-white flex items-center justify-between">
        <div className="space-x-4">
          <button onClick={() => setActiveTab('profile')} className="hover:bg-blue-700 px-3 py-2 rounded">Profile</button>
          <button onClick={() => setActiveTab('Work Completed')} className="hover:bg-blue-700 px-3 py-2 rounded">Work Completed</button>
          <button onClick={() => setActiveTab('portfolio')} className="hover:bg-blue-700 px-3 py-2 rounded">Portfolio</button>
          <button onClick={() => setActiveTab('availability')} className="hover:bg-blue-700 px-3 py-2 rounded">Availability</button>
          <button onClick={() => setActiveTab('bookings')} className="hover:bg-blue-700 px-3 py-2 rounded">Bookings</button>
        </div>
        <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white">Logout</button>
      </nav>

      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CleanerPage;
