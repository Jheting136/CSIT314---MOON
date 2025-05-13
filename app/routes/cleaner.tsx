import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { UserHistoryController } from "../controllers/userHistoryController";
import { handleLogout } from "../controllers/logoutController";
import { PortfolioController } from "../controllers/portfolioController";
import { PortfolioImage } from "../models/portfolioImage";
import { type HistoryItem } from "../models/userHistoryModel";
import type { User } from '../controllers/viewUserProfileController';
import { UserProfileService } from '../services/UserProfileServices';
import { JobService} from '../services/JobServices';

const CleanerPage: React.FC = () => {
  const [userId, setUserId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "profile" | "Work Completed" | "portfolio" | "availability" | "bookings"
  >("profile");
  const [jobs, setJobs] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [workCompletedSortOrder, setWorkCompletedSortOrder] = useState<'asc' | 'desc'>('desc');
  const [bookingsSortOrder, setBookingsSortOrder] = useState<'asc' | 'desc'>('asc');
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: "",
    end: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState(userData?.bio || '');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentAvailability, setCurrentAvailability] = useState<any[]>([]);
 const capitalizeService = (service: string): string => {
  return service.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};
const STANDARD_SERVICES = [
  "Deep Cleaning",
  "General Cleaning",
  "Kitchen Cleaning",
  "Post-Renovation",
  "Window Cleaning",
  "Carpet Cleaning",
  "Office Cleaning",
  "Commercial Cleaning",
  "Floor Maintenance"
];
const [availableServices, setAvailableServices] = useState<string[]>(STANDARD_SERVICES);


  // Fetch the data when the active tab changes
  useEffect(() => {
    const userId = localStorage.getItem("userId") || "";
    setUserId(userId);

    if (!userId) return;

    const loadAll = async () => {
      try {
        setLoading(true);

        const userProfileService = new UserProfileService(userId);
        const jobService = new JobService(userId);

        const [userData, services, portfolioImages] = await Promise.all([
          userProfileService.fetchUserData(),
          jobService.fetchAvailableServices(),
          PortfolioController.fetchImages(userId)
        ]);

        setUserData(userData);
        setBioDraft(userData.bio || '');
        setAvailableServices(services);
        setPortfolioImages(portfolioImages);

        if (activeTab === "Work Completed") {
          const jobs = await jobService.fetchCompletedJobs(workCompletedSortOrder, serviceFilter, dateRange);
          setJobs(jobs);
        } else if (activeTab === "bookings") {
          const bookings = await jobService.fetchBookings(bookingsSortOrder);
          setJobs(bookings);
        } else if (activeTab === "availability") {
          await fetchCurrentAvailability();
        }

      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [activeTab, workCompletedSortOrder, bookingsSortOrder]);

  const fetchCurrentAvailability = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('cleaner_id', userId)
        .order('date', { ascending: true });

      if (error) throw error;
      
      setCurrentAvailability(data || []);
    } catch (err) {
      console.error("Error fetching availability:", err);
      setError("Failed to load availability");
    }
  };

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service) 
        : [...prev, service]
    );
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

 const saveAvailability = async () => {
  if (!userId || selectedServices.length === 0 || !selectedDate) {
    alert("Please select at least one service and a date");
    return;
  }try {
    // Validate services
    const validServices = selectedServices.filter(service =>
      STANDARD_SERVICES.includes(service)
    );

    if (validServices.length === 0) {
      alert("Please select valid services");
      return;
    }

    const { error } = await supabase
      .from('availability')
      .insert(
        validServices.map(service => ({
          cleaner_id: userId,
          service,
          date: selectedDate
        }))
      );

    if (error) throw error;

    alert("Availability saved successfully!");
    fetchCurrentAvailability();
    setSelectedDate("");
    setSelectedServices([]);
  } catch (err) {
    console.error("Error saving availability:", err);
    alert("Failed to save availability");
  }
};
  const deleteAvailability = async (id: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('availability')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchCurrentAvailability();
    } catch (err) {
      console.error("Error deleting availability:", err);
      alert("Failed to delete availability");
    }
  };
  // Fetch completed jobs for 'Work Completed' tab with filters
  const fetchCompletedJobs = async () => {
    setLoading(true);
    setError(null);

    if (!userId) {
      setError("Failed to get authenticated user");
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('cleaner_id', userId)
        .eq('status', 'Completed');

      // Apply service filter if selected
      if (serviceFilter) {
        query = query.eq('service', serviceFilter);
      }

      // Apply date range filter if selected
      if (dateRange.start) {
        query = query.gte('date', dateRange.start);
      }
      if (dateRange.end) {
        query = query.lte('date', dateRange.end);
      }

      // Apply sorting
      query = query.order('date', { ascending: workCompletedSortOrder === 'asc' });

      const { data, error } = await query;
      
      if (error) throw error;
      
      setJobs(data || []);
    } catch (err) {
      setError("Failed to fetch completed jobs.");
      console.error(err);
    }

    setLoading(false);
  };
//save bio
  const handleSaveBio = async () => {
  if (!userId) return;

  try {
    setLoading(true);
    const { error } = await supabase
      .from('users')
      .update({ bio: bioDraft })
      .eq('id', userId);

    if (error) throw error;

    // Update local state
    setUserData((prev: User | null) => ({ ...prev!, bio: bioDraft }));
    setIsEditing(false);
  } catch (err) {
    console.error("Error updating bio:", err);
    setError("Failed to update bio");
  } finally {
    setLoading(false);
  }
};

  // Fetch bookings for 'bookings' tab
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    if (!userId) {
      setError("Failed to get authenticated user");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('cleaner_id', userId)
        .in('status', ['Pending', 'Approved', 'Rejected'])
        .order('date', { ascending: bookingsSortOrder === 'asc' });
      
      if (error) throw error;
      
      setJobs(data || []);
    } catch (err) {
      setError("Failed to fetch bookings.");
      console.error(err);
    }

    setLoading(false);
  };

  // Function to get the color based on job status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-amber-500";
      case "approved":
        return "text-green-500";
      case "rejected":
        return "text-red-500";
      case "completed":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  // Handle file selection for image upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  // Handle file upload to portfolio
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Invalid file type. Please select an image file.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      alert("File size is too large. Please select a file smaller than 5MB.");
      return;
    }

    setUploading(true);

    if (!userId) {
      alert("User not authenticated");
      setUploading(false);
      return;
    }

    try {
      const uploadedImage = await PortfolioController.uploadImage(
        userId,
        selectedFile
      );
      setPortfolioImages((prevImages) => [...prevImages, uploadedImage]);
      alert("Upload successful!");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed due to an unexpected error.");
    }

    setUploading(false);
    setSelectedFile(null);
  };

  // Handle image deletion from portfolio
  const handleDeleteImage = async (image: PortfolioImage) => {
    if (!userId) {
      alert("User not authenticated");
      return;
    }

    try {
      await PortfolioController.deleteImage(userId, image.id);
      setPortfolioImages((prevImages) =>
        prevImages.filter((img) => img.id !== image.id)
      );
      alert("Image deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("An error occurred while deleting the image.");
    }
  };

  // Fetch portfolio images
  const fetchPortfolioImages = async () => {
    setLoading(true);
    setError(null);

    if (!userId) {
      setError("Failed to get authenticated user");
      setLoading(false);
      return;
    }

    try {
      const images = await PortfolioController.fetchImages(userId);
      setPortfolioImages(images);
    } catch (err) {
      setError("Failed to fetch portfolio images.");
    }

    setLoading(false);
  };

  // Update job status
  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);
      
      if (error) throw error;
      
      // Refresh bookings after update
      fetchBookings();
    } catch (err) {
      console.error("Error updating job status:", err);
      alert("Failed to update job status");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-lg overflow-hidden p-6 text-white border border-gray-700">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-bold">Cleaner Profile</h2>
    <button
      onClick={() => setIsEditing(!isEditing)}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
    >
      {isEditing ? 'Cancel' : 'Edit Profile'}
    </button>
  </div>

  {userData && (
    <div className="space-y-6">
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Name</p>
            <p className="font-medium">{userData.name}</p>
          </div>
          <div>
            <p className="text-gray-400">Email</p>
            <p className="font-medium">{userData.email}</p>
          </div>
          <div>
            <p className="text-gray-400">Account Type</p>
            <p className="font-medium">{userData.account_type}</p>
          </div>
          <div>
            <p className="text-gray-400">Hourly Rate</p>
            <p className="font-medium">${userData.rates || 'Not set'}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">About Me</h3>
          {isEditing && (
            <button
              onClick={handleSaveBio}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
            >
              Save
            </button>
          )}
        </div>
        
        {isEditing ? (
          <textarea
            value={bioDraft}
            onChange={(e) => setBioDraft(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded p-3 text-white"
            rows={4}
            placeholder="Tell clients about your cleaning experience and specialties..."
          />
        ) : (
          <p className="text-gray-300 whitespace-pre-line">
            {userData.bio || 'No bio provided.'}
          </p>
        )}
      </div>

      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold mb-3">Portfolio Showcase</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          {portfolioImages.slice(0, 3).map((image) => (
            <div key={image.id} className="relative aspect-square">
              <img
                src={image.publicUrl}
                alt="Portfolio work"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => setActiveTab("portfolio")}
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
        >
          Manage Portfolio
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )}
</div>
        );

    case "Work Completed":
  return (
    <div className="max-w-6xl mx-auto text-white">
     
      
      {/* Filter Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-black mr-2">Sort by:</span>
          <select
            className="bg-gray-800 text-white border border-gray-600 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              if (e.target.value === 'date-asc' || e.target.value === 'date-desc') {
                setWorkCompletedSortOrder(e.target.value === 'date-asc' ? 'asc' : 'desc');
                fetchCompletedJobs();
              } else if (e.target.value === 'service-asc' || e.target.value === 'service-desc') {
                setJobs(prevJobs => [...prevJobs].sort((a, b) => {
                  const comparison = a.service.localeCompare(b.service);
                  return e.target.value === 'service-asc' ? comparison : -comparison;
                }));
              }
            }}
          >
            <option value="date-desc">Newest First ▼</option>
            <option value="date-asc">Oldest First ▲</option>
            <option value="service-asc">Service A-Z</option>
            <option value="service-desc">Service Z-A</option>
          </select>
        </div>
      </div>

      {/* Job List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : jobs.length === 0 ? (
        <div className="bg-gray-800 p-8 rounded-lg text-center border border-gray-700">
          <p className="text-gray-400">No completed jobs found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="p-4 border border-gray-700 rounded-lg shadow-sm bg-gray-800 hover:bg-gray-750 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-lg">{job.service?.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</p>
                  <p className="text-gray-300">{job.location}</p>
                  <p className="text-sm text-gray-400">{new Date(job.date).toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.rating ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                    {job.rating ? `Rating: ${job.rating}` : 'No rating'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );


    case "portfolio":
  return (
    <div className="max-w-6xl mx-auto text-white">
      
      
      {/* Upload Card */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 border border-gray-700">
        <div className="flex items-center mb-4">
          <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer mr-2 inline-block transition-colors">
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
            className={`${uploading ? 'bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium px-4 py-2 rounded transition-all`}
          >
            {uploading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : 'Upload'}
          </button>
          {selectedFile && (
            <span className="ml-2 text-sm text-gray-300 truncate max-w-xs">
              {selectedFile.name}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400">
          Upload images of your previous work to showcase your skills.
        </p>
      </div>

      {/* Image Grid */}
      {portfolioImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {portfolioImages.map((image) => (
            <div key={image.id} className="relative group rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-all">
              <img
                src={image.publicUrl}
                alt={`Portfolio work`}
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => handleDeleteImage(image)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                title="Delete image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 p-8 rounded-lg text-center border border-gray-700">
          <p className="text-gray-400">No portfolio images yet. Upload some to showcase your work!</p>
        </div>
      )}
    </div>
  );

   case "availability":
  return (
    <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-lg overflow-hidden md:max-w-2xl p-6 text-white border border-gray-700">
      <h2 className="text-2xl font-bold mb-4">Set Your Availability</h2>
      <p className="text-gray-300 mb-6">
        Select the services you provide and the dates you're available to work.
      </p>
      
      <div className="space-y-6">
        {/* Service Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Services You Provide</h3>
          <div className="grid grid-cols-2 gap-2">
            {STANDARD_SERVICES.map(service => (
              <div key={service} className="flex items-center">
                <input
                  type="checkbox"
                  id={`service-${service}`}
                  className="mr-2"
                  checked={selectedServices.includes(service)}
                  onChange={() => handleServiceToggle(service)}
                />
                <label htmlFor={`service-${service}`}>
                  {service}
                </label>
              </div>
            ))}
          </div>
        </div>

              {/* Date Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Available Dates</h3>
                <div className="flex flex-col space-y-4">
                  <div>
                    <label htmlFor="avail-date" className="block text-sm font-medium mb-1">
                      Select Date
                    </label>
                    <input
                      type="date"
                      id="avail-date"
                      className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={handleDateChange}
                    />
                  </div>
                  
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                    onClick={saveAvailability}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Add Availability'}
                  </button>
                </div>
              </div>

              {/* Current Availability List */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Your Current Availability</h3>
                <div className="bg-gray-900 rounded-lg p-4">
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : currentAvailability.length === 0 ? (
                    <p className="text-gray-400 text-center">No availability set yet</p>
                  ) : (
                   <div className="space-y-2">
  {currentAvailability.map(avail => (
    <div key={avail.id} className="flex justify-between items-center p-2 bg-gray-800 rounded">
      <div>
        <span className="font-medium">
          {capitalizeService(avail.service)}
        </span>
        <span className="text-gray-400 ml-2">
          {new Date(avail.date).toLocaleDateString()}
        </span>
      </div>
                          <button
                            onClick={() => deleteAvailability(avail.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

     case "bookings":
  return (
    <div className="max-w-6xl mx-auto text-white">
      {/* Filter Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-black mr-2">Sort by:</span>
          <select
            className="bg-gray-800 text-white border border-gray-600 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              if (e.target.value === 'date-asc' || e.target.value === 'date-desc') {
                setBookingsSortOrder(e.target.value === 'date-asc' ? 'asc' : 'desc');
                fetchBookings();
              } else if (e.target.value === 'service-asc' || e.target.value === 'service-desc') {
                setJobs(prevJobs => [...prevJobs].sort((a, b) => {
                  const comparison = a.service.localeCompare(b.service);
                  return e.target.value === 'service-asc' ? comparison : -comparison;
                }));
              }
            }}
          >
            <option value="date-desc">Newest First ▼</option>
            <option value="date-asc">Oldest First ▲</option>
            <option value="service-asc">Service A-Z</option>
            <option value="service-desc">Service Z-A</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : jobs.length === 0 ? (
        <div className="bg-gray-800 p-8 rounded-lg text-center border border-gray-700">
          <p className="text-gray-400">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="p-4 border border-gray-700 rounded-lg shadow-sm bg-gray-800 hover:bg-gray-750 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-lg">{job.service?.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</p>
                  <p className="text-gray-300">{job.location}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(job.date).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.status === 'Pending'
                        ? 'bg-amber-900 text-amber-300'
                        : job.status === 'Approved'
                        ? 'bg-green-900 text-green-300'
                        : job.status === 'Rejected'
                        ? 'bg-red-900 text-red-300'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              </div>

              {job.status === 'Pending' && (
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => updateJobStatus(job.id, 'Approved')}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateJobStatus(job.id, 'Rejected')}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

default:
  return null;

    }
  };

 return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-blue-600 p-4 text-white">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <h1 className="text-xl font-bold mb-4 md:mb-0">
            {userData?.name || 'Cleaner Dashboard'}
          </h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-3 py-2 rounded ${activeTab === 'profile' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("Work Completed")}
              className={`px-3 py-2 rounded ${activeTab === 'Work Completed' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
            >
              Work Completed
            </button>
            <button
              onClick={() => setActiveTab("portfolio")}
              className={`px-3 py-2 rounded ${activeTab === 'portfolio' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
            >
              Portfolio
            </button>
            <button
              onClick={() => setActiveTab("availability")}
              className={`px-3 py-2 rounded ${activeTab === 'availability' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
            >
              Availability
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-3 py-2 rounded ${activeTab === 'bookings' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
            >
              Bookings
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 md:p-6">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default CleanerPage;