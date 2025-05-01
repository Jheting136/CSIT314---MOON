import { useState } from "react";
import { supabase } from "../lib/supabaseClient"; 
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Login failed: " + error.message);
      return;
    }

     // Get logged-in user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    setError("Failed to retrieve user info.");
    return;
  }

  // Fetch user's role from the users table
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("account_type")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    setError("Unable to fetch user role.");
    return;
  }

    //Redirect based on role
    const role = profile.account_type;
    if (role === "admin") {
      window.location.href = "/admin";
    } else if (role === "cleaner") {
      window.location.href = "/cleaner";
    } else {
      window.location.href = "/homeowner";
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 max-w-md w-full"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Log In
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
        />

        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 mb-6 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
        >
          Log In
        </button>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">
            Create one
          </a>
        </p>
      </form>
    </main>
  );
}
