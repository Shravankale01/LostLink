
"use client";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddItemPage() {
  const router = useRouter();

  const [item, setItem] = useState({
    title: "",
    description: "",
    location: "",
    status: "found",
  });

  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddItem = async () => {
    if (!item.title || !item.description || !item.location || !image) {
      toast.error("All fields including image are required");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", item.title);
      formData.append("description", item.description);
      formData.append("location", item.location);
      formData.append("status", item.status);
      formData.append("image", image);

      await axios.post("/api/items/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Item added successfully!");
      router.push("/profile");
    } catch (err: unknown) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-0 relative text-gray-900">
      {/* Top-right Home Button */}
      <div className="fixed top-6 right-6 z-50">
        <Link href="/">
          <button
            type="button"
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded shadow transition"
            aria-label="Go to Homepage"
            title="Go to Homepage"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0L5 21h14"
              />
            </svg>
            Home
          </button>
        </Link>
      </div>

      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 border border-gray-200">
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-900">
          Add Found Item
        </h2>

        {/* Title */}
        <div className="mb-5">
          <label
            htmlFor="title"
            className="block text-gray-700 font-medium mb-1"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={item.title}
            onChange={(e) => setItem({ ...item, title: e.target.value })}
            placeholder="Item name"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          />
        </div>

        {/* Description */}
        <div className="mb-5">
          <label
            htmlFor="description"
            className="block text-gray-700 font-medium mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            value={item.description}
            onChange={(e) => setItem({ ...item, description: e.target.value })}
            rows={4}
            placeholder="Describe the item"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 bg-white"
          />
        </div>

        {/* Location */}
        <div className="mb-5">
          <label
            htmlFor="location"
            className="block text-gray-700 font-medium mb-1"
          >
            Location
          </label>
          <input
            id="location"
            type="text"
            value={item.location}
            onChange={(e) => setItem({ ...item, location: e.target.value })}
            placeholder="Where did you lose/find it?"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-5">
          <label
            htmlFor="image"
            className="block text-gray-700 font-medium mb-1"
          >
            Image
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="w-full rounded-md border border-gray-300 p-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Dropdown */}
        <div className="mb-6">
          <label
            htmlFor="status"
            className="block text-gray-700 font-medium mb-1"
          >
            Status
          </label>
          <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
          {item.status}
        </div>

        </div>

        {/* Submit Button */}
        <button
          onClick={handleAddItem}
          disabled={loading}
          type="button"
          className={`w-full py-3 rounded-md text-white font-semibold transition ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Submitting..." : "Submit Item"}
        </button>
      </div>
    </div>
  );
}

