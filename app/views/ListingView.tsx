import type { CleaningService } from "../models/listingModel";

import { listingController } from "../controllers/listingController";

interface ListingViewProps {
  listings: CleaningService[];
}

const ListingView: React.FC<ListingViewProps> = ({ listings }) => {
  return (
    <div>
      <h1>Available Cleaning Services</h1>
      <br></br>
      <ul>
        {listings.map((listing) => (
          <li key={listing.id}>
            <h3>{listing.title}</h3>
            <p>{listing.description}</p>
            <p>
              <strong>${listing.price}</strong> by {listing.provider} (
              {listing.location})
            </p>
            <br></br>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListingView;
