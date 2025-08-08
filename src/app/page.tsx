
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const fetchItems = async () => {
    try {
      const res = await axios.get("/api/items/getAll");
      setItems(res.data.items || []);
    } catch (err) {
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get("/api/users/me");
      setCurrentUserId(res.data._id);
    } catch {
      // User might not be logged in, that's okay
      console.log("User not logged in");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await axios.post("/api/users/logout");
      if (res.status === 200) {
        toast.success("Logged out successfully!");
        router.replace("/login");
      } else {
        toast.error("Failed to logout");
      }
    } catch {
      toast.error("Failed to logout");
    }
  };

  const handleClaim = async (itemId: string) => {
    if (!currentUserId) {
      toast.error("Please log in to claim items");
      return;
    }
    try {
      const res = await axios.patch(`/api/items/claim/${itemId}`);
      if (res.status === 200) {
        toast.success("Item claimed successfully");
        await fetchItems();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Claim failed");
    }
  };

  const resolveImage = (item: any) => {
    return (
      item.imageUrl ||
      (Array.isArray(item.images) && item.images[0]) ||
      item.image ||
      item.file ||
      null
    );
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchItems();
  }, []);

  const filteredItems = items.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Beautiful profile icon and centered title */}
      <div className="relative mb-8 max-w-6xl mx-auto flex flex-col items-center">
        <button
          onClick={() => router.push("/profile")}
          aria-label="Profile"
          title="Go to profile"
          className="absolute left-0 top-1 w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-green-400 shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 outline-none border-4 border-white"
          style={{ zIndex: 5 }}
        >
          {/* Stylish User SVG icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2" fill="currentColor"/>
            <path
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 21c0-3.866-3.134-7-7-7s-7 3.134-7 7"
              fill="none"
            />
          </svg>
        </button>
        <h1 className="text-4xl font-bold text-blue-800 tracking-widest text-center pt-2 mb-2">
          Lost &amp; Found Items
        </h1>
      </div>

      {/* Top Actions Row (Search & Add/Logout Buttons) */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 px-2 sm:px-0">
        {/* Spacer at left for profile button placement */}
        <div className="w-14 h-0 hidden sm:block" />
        {/* Search */}
        <div className="flex-grow min-w-[220px] max-w-md w-full">
          <input
            type="text"
            placeholder="Search items by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            aria-label="Search items"
          />
        </div>
        {/* Buttons */}
        <div className="flex gap-3 flex-shrink-0">
          <Link href="/add_item">
            <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition duration-200 font-semibold whitespace-nowrap">
              + Add Item
            </button>
          </Link>
          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition duration-200 font-semibold whitespace-nowrap"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Items Grid */}
      <div className="max-w-6xl mx-auto px-2 sm:px-0">
        {loading ? (
          <p className="text-center text-gray-600">Loading items...</p>
        ) : filteredItems.length === 0 ? (
          <p className="text-center text-gray-500">No items found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition duration-200"
              >
                {/* Image Section */}
                <div className="mb-4">
                  {resolveImage(item) ? (
                    <div className="w-full h-48 overflow-hidden rounded-lg">
                      <img
                        src={resolveImage(item)}
                        alt={item.title}
                        className="w-full h-full object-cover transition duration-200 hover:scale-105"
                        onError={(e) => {
                          const imgElement = e.currentTarget as HTMLImageElement;
                          imgElement.style.display = "none";
                          const placeholder = imgElement.nextElementSibling as HTMLElement;
                          if (placeholder) placeholder.style.display = "flex";
                        }}
                      />
                      {/* Fallback placeholder (hidden by default) */}
                      <div
                        className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-500"
                        style={{ display: "none" }}
                      >
                        <span>No Image Available</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                      <span>No Image Available</span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="mb-4">
                  <h2 className="text-xl font-bold mb-2 text-gray-800">{item.title}</h2>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {item.status}
                    </span>
                    {item.location && (
                      <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        📍 {item.location}
                      </span>
                    )}
                  </div>
                </div>
                {/* Action Section */}
                <div className="pt-3 border-t border-gray-100">
                  {item.isClaimed && item.claimedBy === currentUserId ? (
                    <Link href={`/chat/${item._id}`}>
                      <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 font-medium">
                        💬 Open Chat
                      </button>
                    </Link>
                  ) : item.isClaimed ? (
                    <div className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-lg text-center font-medium border border-red-200">
                      ❌ Already Claimed
                    </div>
                  ) : (
                    <button
                      onClick={() => handleClaim(item._id)}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                    >
                      🤝 Claim
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
