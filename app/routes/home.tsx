// File: app/routes/home.tsx
// This component renders the main landing page of the application.

// The 'Route.MetaArgs' type might be defined in a '+types/home.ts' or similar
// file specific to your React Router setup for type-safe meta functions.
// If it's not, you might need to adjust or remove the type annotation.
import type { Route } from "./+types/home"; // Assuming this path is correct for your project structure
import { useEffect } from "react";

/**
 * Meta function to provide metadata for the home route.
 * This is used by React Router to set document head tags like title and description.
 */
export function meta({}: Route.MetaArgs) {
  // The argument is often empty if not using loader data etc.
  return [
    { title: "CleanConnect | Your Trusted Home Cleaning Matchmaker" },
    {
      name: "description",
      content: "Login or create an account to manage your cleaning needs.",
    }, // Updated description
  ];
}

/**
 * Home component - The main landing page.
 * Displays a welcome message and a call to action to log in.
 */
export default function Home() {
  useEffect(() => {
    // Check for userType in localStorage and redirect accordingly
    const userType = localStorage.getItem("userType");

    if (userType) {
      switch (userType) {
        case "homeowner":
          window.location.href = "/homeowner";
          break;
        case "cleaner":
          window.location.href = "/cleaner";
          break;
        case "admin":
          window.location.href = "/admin";
          break;
        default:
          // If userType is invalid, do nothing and show the default home page
          break;
      }
    }
  }, []);

  return (
    <main className="bg-gradient-to-b from-gray-900 via-gray-950 to-black min-h-screen text-white flex flex-col justify-center items-center px-4">
      <section className="text-center max-w-xl">
        <h1 className="text-5xl font-extrabold mb-4">
          Welcome to CleanConnect
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          {/* Updated tagline to reflect no immediate browse option */}
          Your trusted platform for connecting homeowners and professional
          cleaners. Log in or create an account to get started.
        </p>

        {/* Button container */}
        <div className="space-x-4">
          {/* "Browse Cleaners" button and its surrounding <a> tag have been removed. */}

          {/* Log In Button - kept */}
          <a href="/login">
            <button className="bg-white px-6 py-3 rounded-lg text-gray-900 hover:bg-gray-100 transition">
              Log In / Sign Up
            </button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="absolute bottom-4 text-sm text-gray-500 text-center">
        &copy; {new Date().getFullYear()} CleanConnect. All rights reserved.
      </footer>
    </main>
  );
}
