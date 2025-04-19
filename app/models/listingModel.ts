export interface CleaningService {
  id: number;
  title: string;
  description: string;
  price: number;
  provider: string;
  location: string;
}

const listings: CleaningService[] = [
  {
    id: 1,
    title: "Basic Home Cleaning",
    description: "Includes living room, kitchen, and one bathroom.",
    price: 60,
    provider: "Jane D.",
    location: "San Francisco, CA",
  },
  {
    id: 2,
    title: "Deep Cleaning",
    description: "Thorough cleaning of entire home, includes windows.",
    price: 120,
    provider: "Mike C.",
    location: "Oakland, CA",
  },
];

export const getAllListings = (): Promise<CleaningService[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(listings), 500); // mock async, to replace with DB call
  });
};
