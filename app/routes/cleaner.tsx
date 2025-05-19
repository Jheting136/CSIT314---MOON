// File: app/routes/cleaner.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  CleanerDashboardController,
  type PortfolioImage,
  type JobHistoryItem,
  type AvailabilityRecord,
} from "../controllers/cleanerDashboardController";
import { handleLogout } from "../controllers/logoutController";
import { PortfolioController } from "../controllers/portfolioController";
import type { User } from "../controllers/viewUserProfileController";

const STANDARD_SERVICES = [
  "Deep Cleaning",
  "General Cleaning",
  "Kitchen Cleaning",
  "Post-Renovation",
  "Window Cleaning",
  "Carpet Cleaning",
  "Office Cleaning",
  "Commercial Cleaning",
  "Floor Maintenance",
];

type SortOption = "date-desc" | "date-asc" | "service-asc" | "service-desc";

const CleanerPage: React.FC = () => {
  const [userId, setUserId] = useState<string>("");
  const [favoriteCount, setFavoriteCount] = useState<number | null>(0);
  const [viewCount, setViewCount] = useState<number | null>(0);
  const [controller, setController] =
    useState<CleanerDashboardController | null>(null);
  const [activeTab, setActiveTab] = useState<
    "profile" | "Work Completed" | "portfolio" | "availability" | "bookings"
  >("profile");

  const [userData, setUserData] = useState<User | null>(null);
  const [shortlistCount, setShortlistCount] = useState<number | null>(null);
  const [completedJobCount, setCompletedJobCount] = useState<number>(0);
  const [portfolioImagesData, setPortfolioImagesData] = useState<
    PortfolioImage[]
  >([]);
  const [currentAvailabilityData, setCurrentAvailabilityData] = useState<
    AvailabilityRecord[]
  >([]);

  // This state will hold the raw data from the controller
  const [rawJobsData, setRawJobsData] = useState<JobHistoryItem[]>([]);
  // This state will hold the data to be displayed (potentially sorted client-side for service)
  const [jobsForDisplay, setJobsForDisplay] = useState<JobHistoryItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");

  const [selectedPortfolioFile, setSelectedPortfolioFile] =
    useState<File | null>(null);
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false);

  const [selectedServicesForAvail, setSelectedServicesForAvail] = useState<
    string[]
  >([]);
  const [selectedDateForAvail, setSelectedDateForAvail] = useState<string>("");

  // Unified sort state for bookings and work completed
  const [currentSortOption, setCurrentSortOption] =
    useState<SortOption>("date-desc");

  function goToManageAccount() {
    window.location.href = "/manageAccount";
  }

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) {
      setUserId(id);
      setController(new CleanerDashboardController(id));
    } else {
      setError("User ID not found. Please log in to access this page.");
      setLoading(false);
    }
  }, []);

  const loadDataForCurrentTab = useCallback(async () => {
    if (!controller || !userId) {
      if (!controller && !error) setLoading(true);
      return;
    }

    setLoading(true);
    setError(null);
    let fetchedJobs: JobHistoryItem[] = [];

    try {
      switch (activeTab) {
        case "profile":
          const profileData = await controller.getInitialProfileData();
          setUserData(profileData.userData);
          setBioDraft(profileData.userData?.bio || "");
          setShortlistCount(profileData.shortlistCount);
          setFavoriteCount(await controller.getFavoriteCount()); // Set favorite count
          setViewCount(await controller.getViewCount()); // Set view count
          setCompletedJobCount(profileData.completedJobCount);
          const imagesForProfile = await PortfolioController.fetchImages(
            userId
          );
          setPortfolioImagesData(imagesForProfile);
          break;
        case "Work Completed":
          // For date sort, controller handles it. For service sort, we fetch by date then sort client-side.
          const dateSortForWork =
            currentSortOption === "date-asc" ? "asc" : "desc";
          fetchedJobs = await controller.getWorkHistory(dateSortForWork);
          setRawJobsData(fetchedJobs);
          break;
        case "bookings":
          const dateSortForBookings =
            currentSortOption === "date-asc" ? "asc" : "desc";
          fetchedJobs = await controller.getBookings(dateSortForBookings);
          console.log("Fetched Bookings Data:", fetchedJobs); // DEBUG LINE
          setRawJobsData(fetchedJobs);
          break;
        case "availability":
          const availability = await controller.getCurrentAvailability();
          setCurrentAvailabilityData(availability);
          break;
        case "portfolio":
          const images = await PortfolioController.fetchImages(userId);
          setPortfolioImagesData(images);
          break;
        default:
          console.warn("Unknown tab selected:", activeTab);
      }
    } catch (err: any) {
      console.error(
        `CleanerPage: Error loading data for tab '${activeTab}':`,
        err
      );
      setError(
        err.message || "An unexpected error occurred while loading data."
      );
      setRawJobsData([]); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, [activeTab, controller, userId, currentSortOption]); // currentSortOption triggers re-fetch for date sorts

  // Effect to apply client-side sorting or pass through raw data
  useEffect(() => {
    let processedJobs = [...rawJobsData];
    if (currentSortOption === "service-asc") {
      processedJobs.sort((a, b) => a.service.localeCompare(b.service));
    } else if (currentSortOption === "service-desc") {
      processedJobs.sort((a, b) => b.service.localeCompare(a.service));
    }
    // For date sorts, rawJobsData is already sorted by the controller
    setJobsForDisplay(processedJobs);
  }, [rawJobsData, currentSortOption]);

  useEffect(() => {
    if (controller && userId) {
      loadDataForCurrentTab();
    }
  }, [controller, userId, loadDataForCurrentTab]); // loadDataForCurrentTab is a dependency

  const handleSaveBio = async () => {
    if (!controller || !userData) return;
    setLoading(true);
    try {
      const updatedUser = await controller.updateUserBio(bioDraft);
      setUserData(updatedUser);
      setBioDraft(updatedUser?.bio || "");
      setIsEditingBio(false);
      alert("Bio updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update bio.");
      alert(`Error: ${err.message || "Failed to update bio."}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePortfolioFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedPortfolioFile(event.target.files?.[0] || null);
  };

  const handlePortfolioUpload = async () => {
    if (!selectedPortfolioFile || !userId) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(selectedPortfolioFile.type)) {
      alert("Invalid file type.");
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (selectedPortfolioFile.size > maxSize) {
      alert("File too large.");
      return;
    }
    setIsUploadingPortfolio(true);
    setError(null);
    try {
      const uploadedImage = await PortfolioController.uploadImage(
        userId,
        selectedPortfolioFile
      );
      setPortfolioImagesData((prev) => [...prev, uploadedImage]);
      alert("Upload successful!");
      setSelectedPortfolioFile(null);
    } catch (err: any) {
      setError(err.message || "Upload failed.");
    } finally {
      setIsUploadingPortfolio(false);
    }
  };

  const handleDeletePortfolioImage = async (image: PortfolioImage) => {
    if (!userId || !image.id) return;
    if (!window.confirm("Delete this image?")) return;
    setLoading(true);
    setError(null);
    try {
      await PortfolioController.deleteImage(userId, image.id);
      setPortfolioImagesData((prev) =>
        prev.filter((img) => img.id !== image.id)
      );
      alert("Image deleted!");
    } catch (err: any) {
      setError(err.message || "Failed to delete image.");
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggleForAvailability = (service: string) => {
    setSelectedServicesForAvail((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleDateChangeForAvailability = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedDateForAvail(e.target.value);
  };

  const handleSaveAvailability = async () => {
    if (!controller) return;
    if (selectedServicesForAvail.length === 0 || !selectedDateForAvail) {
      alert("Select service(s) and a date.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await controller.saveAvailability(
        selectedDateForAvail,
        selectedServicesForAvail
      );
      alert("Availability saved!");
      const updatedAvailability = await controller.getCurrentAvailability();
      setCurrentAvailabilityData(updatedAvailability);
      setSelectedDateForAvail("");
      setSelectedServicesForAvail([]);
    } catch (err: any) {
      setError(err.message || "Failed to save availability.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAvailability = async (availabilityId: string) => {
    if (!controller) return;
    if (!window.confirm("Remove this availability slot?")) return;
    setLoading(true);
    setError(null);
    try {
      await controller.deleteAvailability(availabilityId);
      const updatedAvailability = await controller.getCurrentAvailability();
      setCurrentAvailabilityData(updatedAvailability);
      alert("Availability removed.");
    } catch (err: any) {
      setError(err.message || "Failed to remove slot.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJobStatus = async (jobId: string, newStatus: string) => {
    if (!controller) return;
    if (newStatus === "Cancelled" && !window.confirm("Cancel this job?"))
      return;
    setLoading(true);
    setError(null);
    try {
      await controller.updateJobStatus(jobId, newStatus);
      alert(`Job status updated to "${newStatus}".`);
      await loadDataForCurrentTab();
    } catch (err: any) {
      setError(err.message || "Failed to update job status.");
    } finally {
      setLoading(false);
    }
  };

  const handleReportJob = async (jobId: string) => {
    if (!controller) return;
    const reason = prompt("Describe the issue:");
    if (reason && reason.trim() !== "") {
      setLoading(true);
      setError(null);
      try {
        await controller.reportProblemOnJob(jobId, reason);
        alert("Report submitted.");
      } catch (err: any) {
        setError(err.message || "Failed to submit report.");
      } finally {
        setLoading(false);
      }
    } else if (reason !== null) {
      alert("Provide a reason for the report.");
    }
  };

  const capitalizeService = (service: string): string => {
    if (!service) return "";
    return service.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const renderTabContent = () => {
    if (!controller && loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-gray-300">Initializing...</p>
        </div>
      );
    }
    if (error && !controller) {
      return <div className="text-red-400 p-4 text-center">Error: {error}</div>;
    }
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-gray-300">Loading {activeTab}...</p>
        </div>
      );
    }
    if (error) {
      return <div className="text-red-400 p-4 text-center">Error: {error}</div>;
    }

    switch (activeTab) {
      case "profile":
        if (!userData)
          return (
            <p className="text-gray-400 text-center py-8">
              Profile data loading or not available.
            </p>
          );
        return (
          // Profile JSX (ensure it's complete and uses correct state variables)
          <div className="max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-lg overflow-hidden p-6 text-white border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Cleaner Profile</h2>
              <div className="flex items-center">
                {favoriteCount !== null && (
                  <div className="bg-pink-600/30 px-3 py-1 rounded-full flex items-center text-sm">
                    <span className="mr-1">❤️</span>
                    <span>{favoriteCount} favorites</span>
                  </div>
                )}
                {viewCount !== null && (
                  <div className="bg-blue-600/30 px-3 py-1 rounded-full flex items-center text-sm">
                    <span className="mr-1">👁️</span>
                    <span>{viewCount} views</span>
                  </div>
                )}
                <button
                  onClick={() => {
                    setIsEditingBio(!isEditingBio);
                    if (!isEditingBio && userData)
                      setBioDraft(userData.bio || "");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors text-sm"
                >
                  {isEditingBio ? "Cancel Edit" : "Edit Profile"}
                </button>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-3">
                  Personal Information
                </h3>
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
                    <p className="font-medium">
                      ${userData.rates || "Not set"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">About Me</h3>
                  {isEditingBio && (
                    <button
                      onClick={handleSaveBio}
                      disabled={loading && isEditingBio}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                    >
                      {loading && isEditingBio ? "Saving..." : "Save Bio"}
                    </button>
                  )}
                </div>
                {isEditingBio ? (
                  <textarea
                    value={bioDraft}
                    onChange={(e) => setBioDraft(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded p-3 text-white"
                    rows={4}
                    placeholder="Tell clients about your cleaning experience and specialties..."
                  />
                ) : (
                  <p className="text-gray-300 whitespace-pre-line min-h-[80px]">
                    {userData.bio ||
                      'No bio provided. Click "Edit Profile" to add one.'}
                  </p>
                )}
              </div>
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-3">
                  Portfolio Showcase (First 3)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  {portfolioImagesData.length > 0 ? (
                    portfolioImagesData.slice(0, 3).map((image) => (
                      <div key={image.id} className="relative aspect-square">
                        <img
                          src={image.publicUrl}
                          alt="Portfolio work"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 col-span-full text-sm">
                      No portfolio images uploaded yet.
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setActiveTab("portfolio")}
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                >
                  Manage Full Portfolio{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 mt-6">
                <h3 className="text-lg font-semibold mb-3">
                  Profile Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-pink-900/30 p-3 rounded-lg">
                    <p className="text-gray-400">Favorites</p>
                    <p className="text-2xl font-bold">
                      {favoriteCount !== null ? favoriteCount : "N/A"}
                    </p>
                  </div>
                  <div className="bg-blue-900/30 p-3 rounded-lg">
                    <p className="text-gray-400">Profile Views</p>
                    <p className="text-2xl font-bold">
                      {viewCount !== null ? viewCount : "N/A"}
                    </p>
                  </div>
                  <div className="bg-green-900/30 p-3 rounded-lg">
                    <p className="text-gray-400">Completed Jobs</p>
                    <p className="text-2xl font-bold">{completedJobCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "Work Completed":
      case "bookings":
        const listTitleJobs =
          activeTab === "Work Completed" ? "Completed Jobs" : "Your Bookings";
        return (
          <div className="max-w-6xl mx-auto text-white">
            <h2 className="text-2xl font-bold mb-6">{listTitleJobs}</h2>
            <div className="flex justify-start items-center mb-6">
              <span className="text-sm text-gray-300 mr-2">Sort by:</span>
              <select
                className="bg-gray-800 text-white border border-gray-600 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentSortOption}
                onChange={(e) =>
                  setCurrentSortOption(e.target.value as SortOption)
                }
              >
                <option value="date-desc">Date: Newest First</option>
                <option value="date-asc">Date: Oldest First</option>
                <option value="service-asc">Service: A-Z</option>
                <option value="service-desc">Service: Z-A</option>
              </select>
            </div>
            {jobsForDisplay.length === 0 && (
              <p className="text-gray-400 text-center py-8">
                No{" "}
                {activeTab === "Work Completed" ? "completed jobs" : "bookings"}{" "}
                found.
              </p>
            )}
            {jobsForDisplay.length > 0 && (
              <div className="space-y-4">
                {jobsForDisplay.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 border border-gray-700 rounded-lg shadow-sm bg-gray-800 hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg">
                          {capitalizeService(job.service)}
                        </p>
                        <p className="text-gray-300">{job.location}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(job.date).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-300 mt-1">
                          Customer: {job.customer_name || "Unknown"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          job.status === "Pending"
                            ? "bg-amber-900 text-amber-300"
                            : job.status === "Approved"
                            ? "bg-green-900 text-green-300"
                            : job.status === "Rejected"
                            ? "bg-red-900 text-red-300"
                            : job.status === "Cancelled"
                            ? "bg-gray-700 text-gray-300"
                            : "bg-blue-900 text-blue-300"
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      {job.status === "Pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateJobStatus(job.id, "Approved")
                            }
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateJobStatus(job.id, "Rejected")
                            }
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {job.status === "Approved" && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateJobStatus(job.id, "Cancelled")
                            }
                            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Cancel Job
                          </button>
                          <button
                            onClick={() => handleReportJob(job.id)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Report Client
                          </button>
                        </>
                      )}
                      {job.status === "Completed" &&
                        activeTab === "Work Completed" && (
                          <button
                            onClick={() => handleReportJob(job.id)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Report Issue
                          </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "portfolio":
        if (!userId) {
          return (
            <p className="text-orange-400 text-center py-8">
              User ID not available. Cannot manage portfolio.
            </p>
          );
        }
        return (
          // Portfolio JSX (ensure it uses portfolioImagesData, handlePortfolioUpload, etc.)
          <div className="max-w-6xl mx-auto text-white">
            <h2 className="text-2xl font-bold mb-6">Manage Your Portfolio</h2>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer mr-2 inline-block transition-colors">
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePortfolioFileChange}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handlePortfolioUpload}
                  disabled={isUploadingPortfolio || !selectedPortfolioFile}
                  className={`${
                    isUploadingPortfolio
                      ? "bg-blue-700 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white font-medium px-4 py-2 rounded transition-all disabled:opacity-50`}
                >
                  {isUploadingPortfolio ? "Uploading..." : "Upload Image"}
                </button>
                {selectedPortfolioFile && (
                  <span className="ml-2 text-sm text-gray-300 truncate max-w-xs">
                    {selectedPortfolioFile.name}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">
                Upload images of your work (max 5MB, JPG/PNG/GIF).
              </p>
            </div>
            {isUploadingPortfolio && (
              <p className="text-gray-400 text-center py-4">
                Uploading image...
              </p>
            )}
            {!isUploadingPortfolio && portfolioImagesData.length === 0 && (
              <p className="text-gray-400 text-center py-8">
                No portfolio images yet. Upload some to showcase your work!
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {portfolioImagesData.map((image) => (
                <div
                  key={image.id}
                  className="relative group rounded-lg overflow-hidden border border-gray-700"
                >
                  <img
                    src={image.publicUrl}
                    alt="Portfolio"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => handleDeletePortfolioImage(image)}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    title="Delete image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case "availability":
        // Availability JSX (ensure it uses currentAvailabilityData, handleSaveAvailability, etc.)
        return (
          <div className="max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-lg p-6 text-white border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Set Your Availability</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Services You Can Provide on This Date
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {STANDARD_SERVICES.map((service) => (
                    <div key={service} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`service-avail-${service}`}
                        className="mr-2 accent-blue-500"
                        checked={selectedServicesForAvail.includes(service)}
                        onChange={() =>
                          handleServiceToggleForAvailability(service)
                        }
                      />
                      <label
                        htmlFor={`service-avail-${service}`}
                        className="text-sm"
                      >
                        {service}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label
                  htmlFor="avail-date"
                  className="block text-sm font-medium mb-1"
                >
                  Select Date
                </label>
                <input
                  type="date"
                  id="avail-date"
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                  min={new Date().toISOString().split("T")[0]}
                  value={selectedDateForAvail}
                  onChange={handleDateChangeForAvailability}
                />
              </div>
              <button
                onClick={handleSaveAvailability}
                disabled={loading && activeTab === "availability"}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50"
              >
                {loading && activeTab === "availability"
                  ? "Saving..."
                  : "Add Availability Slot"}
              </button>
              <div>
                <h3 className="text-lg font-semibold mt-6 mb-2">
                  Your Current Availability
                </h3>
                <div className="bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {currentAvailabilityData.length === 0 && (
                    <p className="text-gray-400 text-center">
                      No availability set yet.
                    </p>
                  )}
                  {currentAvailabilityData.map((avail) => (
                    <div
                      key={avail.id}
                      className="flex justify-between items-center p-2 bg-gray-800 rounded mb-2"
                    >
                      <div>
                        <span className="font-medium">
                          {capitalizeService(avail.service)}
                        </span>
                        <span className="text-gray-400 ml-2 text-sm">
                          {new Date(avail.date).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteAvailability(avail.id)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <p className="text-center text-gray-400 py-8">
            Please select a tab to view content.
          </p>
        );
    }
  };

  if (!userId || !controller) {
    if (error)
      return (
        <div className="min-h-screen flex justify-center items-center bg-gray-900 text-red-400 p-6 text-xl">
          {error}
        </div>
      );
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-xl text-gray-300">Initializing Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white font-sans">
      <nav className="bg-blue-600 p-4 text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <h1 className="text-xl font-bold mb-4 md:mb-0">
            {userData?.name
              ? `${userData.name}'s Dashboard`
              : "Cleaner Dashboard"}
          </h1>
          <div className="flex flex-wrap gap-2">
            {(
              [
                "profile",
                "Work Completed",
                "bookings",
                "availability",
                "portfolio",
              ] as const
            ).map((tabName) => (
              <button
                key={tabName}
                onClick={() => setActiveTab(tabName)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  activeTab === tabName
                    ? "bg-blue-700 ring-2 ring-blue-300"
                    : "hover:bg-blue-700"
                }`}
              >
                {tabName.charAt(0).toUpperCase() +
                  tabName
                    .slice(1)
                    .replace(/([A-Z])/g, " $1")
                    .trim()}
                {tabName === "profile" &&
                  shortlistCount !== null &&
                  shortlistCount > 0 && (
                    <span className="ml-2 bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {shortlistCount}
                    </span>
                  )}
              </button>
            ))}
            <button
              onClick={() => goToManageAccount()}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white text-sm font-medium border border-white"
            >
              Manage Account
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 md:p-6">{renderTabContent()}</main>
    </div>
  );
};

export default CleanerPage;
