import React, { useEffect, useState } from "react";
import ListingView from "../views/ListingView";
import { fetchListings } from "../controllers/listingController";
import type { CleaningService } from "../models/listingModel";

const ListingsPage: React.FC = () => {
  const [listings, setListings] = useState<CleaningService[]>([]);

  useEffect(() => {
    fetchListings().then(setListings);
  }, []);

  return (
    <div className="container">
      <ListingView listings={listings} />
    </div>
  );
};

export default ListingsPage;
