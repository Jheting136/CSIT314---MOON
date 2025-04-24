import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CleanConnect | Your Trusted Home Cleaning Matchmaker" },
    { name: "description", content: "Login or browse our freelance cleaner listings." },
  ];
}

export default function Home() {
  return (
    <main className="bg-gradient-to-b from-gray-900 via-gray-950 to-black min-h-screen text-white flex flex-col justify-center items-center px-4">
      <section className="text-center max-w-xl">
        <h1 className="text-5xl font-extrabold mb-4">Welcome to CleanConnect</h1>
        <p className="text-lg text-gray-300 mb-8">
          Find trusted freelance cleaners. Book instantly. Cleaner homes, hassle-free.
        </p>

        <div className="space-x-4">
          <a href="/listings">
            <button className="bg-blue-600 px-6 py-3 rounded-lg text-white hover:bg-blue-700 transition">
              Browse Cleaners
            </button>
          </a>
          <a href="/login">
            <button className="bg-white px-6 py-3 rounded-lg text-gray-900 hover:bg-gray-100 transition">
              Log In
            </button>
          </a>
        </div>
      </section>

      <footer className="absolute bottom-4 text-sm text-gray-500 text-center">
        &copy; {new Date().getFullYear()} CleanConnect. All rights reserved.
      </footer>
    </main>
  );
}
