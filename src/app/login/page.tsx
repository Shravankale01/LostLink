"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    setDisabled(!user.email || !user.password);
  }, [user]);

  useEffect(() => {
    if (window.location.search.includes("verified=true")) {
      toast.success("Email verified! You can now log in.");
      // Optionally, clear the query param or avoid multiple toasts
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const onLogin = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post("/api/users/login", user);
      toast.success(data.message);
      router.push(data.redirectTo);
    } catch (error: unknown) {
      let message = "Login failed";

      // Narrow error type to safely access nested properties
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as any).response === "object" &&
        (error as any).response !== null &&
        "data" in (error as any).response &&
        (error as any).response.data !== null &&
        typeof (error as any).response.data === "object" &&
        "error" in (error as any).response.data
      ) {
        message = (error as any).response.data.error;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 via-green-300 to-teal-400 px-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8">
          {loading ? "Authenticating..." : "Log In"}
        </h2>
        <input
          type="email"
          placeholder="Email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          className="w-full mb-6 p-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-4 focus:ring-green-400 focus:border-transparent transition"
        />
        <input
          type="password"
          placeholder="Password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          className="w-full mb-8 p-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-4 focus:ring-green-400 focus:border-transparent transition"
        />
        <button
          onClick={onLogin}
          disabled={disabled || loading}
          className={`w-full p-3 rounded-lg text-white text-lg font-semibold 
            ${disabled || loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-500 focus:ring-opacity-50"
            }`}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-green-600 font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
