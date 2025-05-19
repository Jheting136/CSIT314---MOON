import React, {
  useState,
  useEffect,
  type ChangeEvent,
  useCallback,
} from "react";
import { handleLogout } from "../controllers/logoutController";
import { listingController } from "~/controllers/listingController";
import {
  type CleanerFilterOptions,
  type FilteredCleanersResult,
} from "../controllers/listingController";
import type { CleaningService } from "../controllers/listingController";

const availableServices = [
  "General Cleaning",
  "Kitchen Cleaning",
  "Bathroom Cleaning",
  "Deep Cleaning",
  "Window Cleaning",
  "Carpet Cleaning",
  "Office Cleaning",
  "Commercial Cleaning",
  "Floor Maintenance",
  "Appliance Cleaning",
  "Eco-Friendly",
  "Detailing",
  "Post-Renovation",
  "Dust Removal",
  "Glass Cleaning",
];

const ITEMS_PER_PAGE = 6;

function goToManageAccount() {
  window.location.href = "/manageAccount";
}

interface FavoriteButtonProps {
  isFavorite: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

interface BookingFormData {
  service: string;
  date: string;
  location: string;
}

function FavoriteButton({
  isFavorite,
  onClick,
  className = "",
}: FavoriteButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent card click when clicking favorite
        onClick(e);
      }}
      className={`text-2xl transition-colors duration-300 ${className}`}
    >
      {isFavorite ? "❤️" : "🤍"}
    </button>
  );
}

interface ModalProps {
  cleaner: CleaningService | null;
  isOpen: boolean;
  onClose: () => void;
  favorites: Set<string>;
  onFavoriteToggle: (id: string, currentState: boolean) => void;
}

function CleanerModal({
  cleaner,
  isOpen,
  onClose,
  favorites,
  onFavoriteToggle,
}: ModalProps & {
  favorites: Set<string>;
  onFavoriteToggle: (id: string, currentState: boolean) => void;
}) {
  if (!isOpen || !cleaner) return null;

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingCleaner, setBookingCleaner] = useState<CleaningService | null>(
    null
  );
  const [bookingError, setBookingError] = useState<string | null>(null);

  const handleBookingSubmit = async (formData: BookingFormData) => {
    setBookingError(null);
    try {
      if (!bookingCleaner) return;

      await listingController.createBooking(
        bookingCleaner.id,
        formData.service,
        formData.location,
        new Date(formData.date)
      );

      setIsBookingModalOpen(false);
      setBookingCleaner(null);
      // Show success message or redirect to bookings page
      alert("Booking created successfully!");
    } catch (error) {
      console.error("Error creating booking:", error);
      setBookingError("Failed to create booking. Please try again.");
    }
  };

  const handleBookNow = (cleaner: CleaningService) => {
    setBookingCleaner(cleaner);
    setIsBookingModalOpen(true);
  };

  const BookingModal = () => {
    if (!isBookingModalOpen || !bookingCleaner) return null;

    const [formData, setFormData] = useState<BookingFormData>({
      service: bookingCleaner.services[0] || "",
      date: "",
      location: "",
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">
              Book {bookingCleaner.provider}
            </h2>
            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg
                className="w-6 h-6"
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

          {bookingError && (
            <div className="mb-4 p-3 bg-red-500 bg-opacity-20 text-red-400 rounded">
              {bookingError}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleBookingSubmit(formData);
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Service
                </label>
                <select
                  value={formData.service}
                  onChange={(e) =>
                    setFormData({ ...formData, service: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                >
                  {bookingCleaner.services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Enter your address"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium"
              >
                Confirm Booking
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Close and favorite buttons */}
          <div className="flex justify-between">
            <FavoriteButton
              isFavorite={favorites.has(cleaner.id)}
              onClick={() =>
                onFavoriteToggle(cleaner.id, favorites.has(cleaner.id))
              }
              className="text-3xl"
            />
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <svg
                className="w-6 h-6"
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

          {/* Cleaner details */}
          <div className="mt-4">
            <div className="flex items-start gap-6">
              <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                <span className="text-gray-400 text-5xl">👤</span>
              </div>

              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      {cleaner.provider}
                    </h2>
                    <p className="text-gray-400">{cleaner.location}</p>
                  </div>
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-lg font-medium">
                    ${cleaner.price}/hr
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {cleaner.title}
                  </h3>
                  <p className="text-gray-300">{cleaner.description}</p>
                </div>

                <div className="mt-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-6 h-6 ${
                            i < Math.floor(cleaner.rating)
                              ? "text-yellow-400"
                              : "text-gray-600"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-gray-400 ml-2 text-lg">
                      ({cleaner.rating.toFixed(1)})
                    </span>
                  </div>

                  <h4 className="text-lg font-semibold text-white mb-2">
                    Services Offered:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cleaner.services.map((service) => (
                      <span
                        key={service}
                        className="bg-gray-700 text-gray-300 px-3 py-2 rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium"
                onClick={() => handleBookNow(cleaner)}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
      <BookingModal />
    </div>
  );
}

export default function HomeownerPage() {
  const [selectedCleaner, setSelectedCleaner] =
    useState<CleaningService | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [minRating, setMinRating] = useState(0);
  const [selectedService, setSelectedService] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [displayedCleaners, setDisplayedCleaners] = useState<CleaningService[]>(
    []
  );
  const [totalCleaners, setTotalCleaners] = useState(0);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const handleFavoriteToggle = async (
    cleanerId: string,
    currentState: boolean
  ) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }
      await listingController.saveFavorite(cleanerId, userId, !currentState);
      setFavorites((prev) => {
        const newFavorites = new Set(prev);
        if (currentState) {
          newFavorites.delete(cleanerId);
        } else {
          newFavorites.add(cleanerId);
        }
        return newFavorites;
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleCardClick = (listing: CleaningService) => {
    setSelectedCleaner(listing);
    setIsModalOpen(true);
    listingController.saveView(listing.id);
  };

  const loadCleaners = useCallback(
    async (pageToLoad: number) => {
      console.log(
        `[HomeownerPage] loadCleaners called for page: ${pageToLoad}`
      );
      setLoading(true);
      setError(null); // Clear previous errors
      const filterOptions: CleanerFilterOptions = {
        searchTerm,
        minPrice,
        maxPrice,
        minRating,
        selectedService,
        page: pageToLoad,
        pageSize: ITEMS_PER_PAGE,
      };

      try {
        const result: FilteredCleanersResult =
          await listingController.fetchAndFilterCleaners(filterOptions);
        console.log("[HomeownerPage] Received result from controller:", result);
        setDisplayedCleaners(result.data);
        setTotalCleaners(result.totalCount);
      } catch (err: any) {
        console.error("[HomeownerPage] Error in loadCleaners:", err);
        setError(err.message || "Could not load cleaners. Please try again.");
        setDisplayedCleaners([]); // Clear data on error
        setTotalCleaners(0);
      } finally {
        // Ensure loading is set to false regardless of success or failure
        setLoading(false);
        console.log("[HomeownerPage] Loading set to false.");
      }
    },
    [searchTerm, minPrice, maxPrice, minRating, selectedService]
  ); // currentPage is handled by its own effect

  // Effect to load cleaners when component mounts or filters change (which resets page)
  useEffect(() => {
    // This effect runs when filters change, which also resets currentPage to 1 (see below).
    // The actual data loading for the new page 1 will be triggered by the currentPage effect.
    // Or, if currentPage is already 1, it will trigger the load.
    console.log(
      "[HomeownerPage] Filters changed, preparing to load page:",
      currentPage
    );
    loadCleaners(currentPage);
  }, [loadCleaners, currentPage]); // Re-run if loadCleaners function reference changes or currentPage changes

  // Effect to reset to page 1 when filters change
  useEffect(() => {
    console.log(
      "[HomeownerPage] Filter state changed, resetting currentPage to 1."
    );
    setCurrentPage(1);
  }, [searchTerm, minPrice, maxPrice, minRating, selectedService]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(e.target.value);
  const handleMinPriceChange = (e: ChangeEvent<HTMLInputElement>) =>
    setMinPrice(e.target.value === "" ? "" : Number(e.target.value));
  const handleMaxPriceChange = (e: ChangeEvent<HTMLInputElement>) =>
    setMaxPrice(e.target.value === "" ? "" : Number(e.target.value));
  const handleRatingChange = (e: ChangeEvent<HTMLInputElement>) =>
    setMinRating(Number(e.target.value));
  const handleServiceChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setSelectedService(e.target.value);

  const totalPages = Math.ceil(totalCleaners / ITEMS_PER_PAGE);

  return (
    <main className="min-h-screen relative bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white p-6">
      <div className="absolute top-6 right-6 z-50 flex gap-4">
        <button
          onClick={() => goToManageAccount()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-lg transition-colors"
        >
          Manage Account
        </button>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded shadow-lg transition-colors"
        >
          Log Out
        </button>
      </div>

      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center text-white mb-10 pt-5">
          Welcome, Homeowner
        </h1>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-white mb-3">
            Find Your Perfect Cleaner
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Browse our trusted network of professional cleaners.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 mb-10 sticky top-4 z-40">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search Input */}
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Search by Name or Service
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700 placeholder-gray-400"
              />
            </div>
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Price Range ($/hr)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={handleMinPriceChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700 placeholder-gray-400"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={handleMaxPriceChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700 placeholder-gray-400"
                />
              </div>
            </div>
            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Minimum Rating
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={minRating}
                  onChange={handleRatingChange}
                  className="w-full accent-blue-500"
                />
                <span className="text-sm font-medium text-gray-300 w-12 text-center">
                  {minRating.toFixed(1)}
                </span>
              </div>
            </div>
            {/* Service Filter */}
            <div>
              <label
                htmlFor="service"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Cleaning Skill
              </label>
              <select
                id="service"
                value={selectedService}
                onChange={handleServiceChange}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-gray-700"
              >
                <option value="">All Skills</option>
                {availableServices.map((serviceName) => (
                  <option
                    key={serviceName}
                    value={serviceName}
                    className="text-gray-900 bg-white"
                  >
                    {serviceName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status Messages and Cleaner Listings */}
        <div className="mb-6 text-center">
          {loading && (
            <p className="text-gray-300 text-lg animate-pulse">
              Loading cleaners...
            </p>
          )}
          {error && (
            <p className="text-red-400 text-lg bg-red-900 bg-opacity-50 p-3 rounded-md">
              {error}
            </p>
          )}
        </div>

        {!loading && !error && totalCleaners === 0 && (
          <p className="text-gray-400 text-center text-xl py-10">
            No cleaners found matching your criteria or available at the moment.
          </p>
        )}

        {!loading && !error && displayedCleaners.length > 0 && (
          <>
            <p className="text-gray-300 text-center mb-6">
              Showing {displayedCleaners.length} of {totalCleaners} cleaners
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedCleaners.map((listing: CleaningService) => (
                <div
                  key={listing.id}
                  className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col cursor-pointer relative"
                  onClick={() => handleCardClick(listing)}
                >
                  {/* Add favorite button to top-right corner */}
                  <div className="absolute top-4 right-4 z-10">
                    <FavoriteButton
                      isFavorite={favorites.has(listing.id)}
                      onClick={(e) =>
                        handleFavoriteToggle(
                          listing.id,
                          favorites.has(listing.id)
                        )
                      }
                    />
                  </div>
                  <div className="h-56 bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gray-700 shadow-md flex items-center justify-center">
                      <span className="text-gray-400 text-3xl">👤</span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h2 className="text-2xl font-semibold text-white">
                          {listing.provider}
                        </h2>
                        <p className="text-gray-400 text-sm">
                          {listing.location}
                        </p>
                      </div>
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                        ${listing.price}/hr
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-3 flex-grow">
                      {listing.title}: {listing.description}
                    </p>
                    <div className="flex items-center mb-4">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(listing.rating)
                                ? "text-yellow-400"
                                : "text-gray-600"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-gray-400 ml-2">
                        ({listing.rating.toFixed(1)})
                      </span>
                    </div>
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-200 mb-1">
                        Services:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {listing.services.map((serviceName) => (
                          <span
                            key={serviceName}
                            className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs"
                          >
                            {serviceName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && !error && totalCleaners > ITEMS_PER_PAGE && (
          <div className="mt-12 flex justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                disabled={currentPage === index + 1}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  currentPage === index + 1
                    ? "bg-blue-600 text-white cursor-default"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
      <CleanerModal
        cleaner={selectedCleaner}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCleaner(null);
        }}
        favorites={favorites}
        onFavoriteToggle={handleFavoriteToggle}
      />
    </main>
  );
}
