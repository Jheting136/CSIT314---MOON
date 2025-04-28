import { useState, useEffect, type ChangeEvent } from 'react';
import type { CleaningService } from '../models/listingModel';
import { getAllListings } from '../models/listingModel';

// Available cleaning services for the filter
const availableServices = [
  "General Cleaning",
  "Kitchen Cleaning",
  "Bathroom Cleaning",
  "Deep Cleaning",
  "Window Cleaning",
  "Carpet Cleaning",
  "Office Cleaning",
  "Commercial Cleaning",
  "Floor Maintenance"
];

export default function ListingsPage() {
  const [listings, setListings] = useState<CleaningService[]>([]);
  const [filteredListings, setFilteredListings] = useState<CleaningService[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [minRating, setMinRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [selectedService, setSelectedService] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      const data = await getAllListings();
      setListings(data);
      setFilteredListings(data);
    };
    fetchListings();
  }, []);

  useEffect(() => {
    const filtered = listings.filter((listing: CleaningService) => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        listing.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.title.toLowerCase().includes(searchTerm.toLowerCase());

      // Price filter
      const matchesPrice = 
        (minPrice === '' || listing.price >= minPrice) && 
        (maxPrice === '' || listing.price <= maxPrice);

      // Rating filter
      const matchesRating = listing.rating >= minRating;

      // Cleaning skill filter
      const matchesService = !selectedService || listing.services.includes(selectedService);
      
      return matchesSearch && matchesPrice && matchesRating && matchesService;
    });
    setFilteredListings(filtered);
    setCurrentPage(1);
  }, [searchTerm, minPrice, maxPrice, minRating, selectedService, listings]);

  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleMinPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? '' : Number(e.target.value);
    setMinPrice(value);
  };

  const handleMaxPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? '' : Number(e.target.value);
    setMaxPrice(value);
  };

  const handleRatingChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMinRating(Number(e.target.value));
  };

  const handleServiceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedService(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Find Your Perfect Cleaner</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Browse through our trusted network of professional cleaners. Filter by price, ratings, and more to find the perfect match for your needs.
          </p>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Search by Name */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-1">
                Search by Name or Service
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search cleaners or services..."
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white bg-gray-700 placeholder-gray-400"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Price Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white bg-gray-700 placeholder-gray-400"
                  value={minPrice}
                  onChange={handleMinPriceChange}
                />
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white bg-gray-700 placeholder-gray-400"
                  value={maxPrice}
                  onChange={handleMaxPriceChange}
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
                  className="w-full accent-blue-500"
                  value={minRating}
                  onChange={handleRatingChange}
                />
                <span className="text-sm font-medium text-gray-300 w-12 text-center">
                  {minRating.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Cleaning Skills Dropdown */}
            <div>
              <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-1">
                Cleaning Skill
              </label>
              <select
                id="service"
                value={selectedService}
                onChange={handleServiceChange}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white bg-gray-700"
              >
                <option value="">All Skills</option>
                {availableServices.map((service) => (
                  <option key={service} value={service} className="text-gray-900">
                    {service}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-300">
            Showing {paginatedListings.length} of {filteredListings.length} cleaners
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedListings.map((listing: CleaningService) => (
            <div 
              key={listing.id} 
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="h-56 bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gray-700 shadow-md flex items-center justify-center">
                  <span className="text-gray-400 text-2xl">👤</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{listing.provider}</h2>
                    <p className="text-gray-400 text-sm">{listing.location}</p>
                  </div>
                  <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ${listing.price}/hr
                  </div>
                </div>
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className={`w-5 h-5 ${i < Math.floor(listing.rating) ? 'text-yellow-400' : 'text-gray-600'}`}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-400 ml-2">({listing.rating.toFixed(1)})</span>
                </div>
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {listing.services.map((service) => (
                      <span 
                        key={service}
                        className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {filteredListings.length > itemsPerPage && (
          <div className="mt-12 flex justify-center gap-2">
            {Array.from({ length: Math.ceil(filteredListings.length / itemsPerPage) }).map((_, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  currentPage === index + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
