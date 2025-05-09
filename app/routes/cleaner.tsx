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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);

  const BUCKET_NAME = 'portfolio'; // 🔁 Replace this with your actual bucket name

  useEffect(() => {
    if (activeTab === 'Work Completed') {
      fetchCompletedJobs();
    } else if (activeTab === 'bookings') {
      fetchBookings();
    } else if (activeTab === 'portfolio') {
      fetchPortfolioImages();
    }
  }, [activeTab]);

  const fetchCompletedJobs = async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

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

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    // Check file type (only images in this case)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Invalid file type. Please select an image file.');
      return;
    }

    // Check file size (limit to 5MB in this example)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSize) {
      alert('File size is too large. Please select a file smaller than 5MB.');
      return;
    }

    setUploading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert('User not authenticated');
      setUploading(false);
      return;
    }

    const fileExt = selectedFile.name.split('.').pop();
    const filePath = `portfolio/${user.id}/${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.error('Upload error:', uploadError.message);  // Log error message
        alert('Upload failed. Please check the console for details.');
        setUploading(false);
        return;
      }

      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
      setPortfolioImages((prev) => [...prev, data.publicUrl]);
      alert('Upload successful!');
    } catch (error) {
      console.error('Unexpected error:', error);  // Log unexpected errors
      alert('Upload failed due to an unexpected error.');
    }

    setUploading(false);
    setSelectedFile(null);
  };

  const handleDeleteImage = async (imageUrl: string) => {
    const imageName = imageUrl.split('/').pop();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert('User not authenticated');
      return;
    }

    try {
      const filePath = `portfolio/${user.id}/${imageName}`;
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (deleteError) {
        console.error('Delete error:', deleteError.message);
        alert('Failed to delete image.');
        return;
      }

      setPortfolioImages((prevImages) => prevImages.filter((url) => url !== imageUrl));
      alert('Image deleted successfully!');
    } catch (error) {
      console.error('Unexpected error during delete:', error);
      alert('An error occurred while deleting the image.');
    }
  };

  const fetchPortfolioImages = async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError('Failed to get authenticated user');
      setLoading(false);
      return;
    }

    const { data, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(`portfolio/${user.id}`, { limit: 100, offset: 0 });

    if (listError) {
      setError('Failed to fetch portfolio images.');
      setLoading(false);
      return;
    }

    const imageUrls = data
      ?.map((file) =>
        supabase.storage.from(BUCKET_NAME).getPublicUrl(`portfolio/${user.id}/${file.name}`).data.publicUrl
      )
      .filter(Boolean) as string[];

    setPortfolioImages(imageUrls);
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
              {portfolioImages.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img 
                    src={url} 
                    alt={`Portfolio ${idx}`} 
                    className="w-full h-48 object-cover rounded shadow" 
                  />
                  <button
                    onClick={() => handleDeleteImage(url)}
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