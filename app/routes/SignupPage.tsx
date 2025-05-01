import { useState } from "react";
import { handleSignup } from "../controllers/signupController";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState("homeowner");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = await handleSignup({ email, password, name, accountType });
    if (errorMsg) setError(errorMsg);
    else window.location.href = "/login";
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 max-w-md w-full"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Create Account
        </h1>

        {error && (
          <p className="mb-4 text-sm text-red-500 text-center">{error}</p>
        )}

        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Name
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
        />

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
          className="w-full px-4 py-2 mb-4 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
        />

        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Account Type
        </label>
        <select
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
          className="w-full px-4 py-2 mb-6 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
        >
          <option value="homeowner">Homeowner</option>
          <option value="cleaner">Cleaner</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
        >
          Sign Up
        </button>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Log in
          </a>
        </p>
      </form>
    </main>
  );
}
