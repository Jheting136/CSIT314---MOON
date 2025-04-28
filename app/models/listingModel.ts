export interface CleaningService {
  id: number;
  title: string;
  description: string;
  price: number;
  provider: string;
  location: string;
  rating: number;
  services: string[];
}

const listings: CleaningService[] = [
  {
    id: 1,
    title: "Basic Home Cleaning",
    description: "Includes living room, kitchen, and one bathroom.",
    price: 60,
    provider: "Jane D.",
    location: "San Francisco, CA",
    rating: 4.5,
    services: ["General Cleaning", "Kitchen Cleaning", "Bathroom Cleaning"]
  },
  {
    id: 2,
    title: "Deep Cleaning",
    description: "Thorough cleaning of entire home, includes windows.",
    price: 120,
    provider: "Mike C.",
    location: "Oakland, CA",
    rating: 4.8,
    services: ["Deep Cleaning", "Window Cleaning", "Carpet Cleaning"]
  },
  {
    id: 3,
    title: "Office Cleaning",
    description: "Professional office cleaning services.",
    price: 90,
    provider: "Sarah M.",
    location: "San Jose, CA",
    rating: 4.2,
    services: ["Office Cleaning", "Commercial Cleaning", "Floor Maintenance"]
  }
];

export const getAllListings = (): Promise<CleaningService[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(listings), 500); // mock async, to replace with DB call
  });
};
