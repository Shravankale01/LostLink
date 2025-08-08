
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

// Adjust the interface to match your backend item response
interface Item {
  _id: string;
  title: string;
  imageUrl?: string;
  createdAt?: string;
  isApproved?: boolean;
  status?: string;
  claimedBy?: { username?: string; email?: string; _id?: string } | null; // Populated by .populate in backend
}

export default function ProfilePage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's items on mount
  useEffect(() => {
    async function fetchUserItems() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("/api/users/item");
        setItems(res.data.items || []);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load your items");
      } finally {
        setLoading(false);
      }
    }
    fetchUserItems();
  }, []);

  // Delete item handler
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    setDeletingId(id);
    try {
      const res = await axios.delete(`/api/items/${id}`);
      if (res.status === 200) {
        toast.success("Item deleted successfully");
        setItems((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete item");
    } finally {
      setDeletingId(null);
    }
  };

  // Main render
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-blue-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800">My Items</h1>
        <button
          onClick={() => router.push("/")}
          className="px-5 py-2 bg-green-600 text-white rounded-full shadow hover:bg-green-700 transition"
        >
          Home
        </button>
      </div>

      {/* Loading/Error/Empty States */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <span className="text-gray-500 text-lg">Loading your items…</span>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <span className="text-red-600 text-lg">{error}</span>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col justify-center items-center min-h-[300px]">
          <span className="text-gray-700 text-xl mb-4">You have not added any items yet.</span>
          <button
            onClick={() => router.push("/add_item")}
            className="px-6 py-3 bg-green-600 text-white rounded shadow hover:bg-green-700"
          >
            Add New Item
          </button>
        </div>
      ) : (
        // Items Grid
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map(({ _id, title, imageUrl, createdAt, isApproved, status, claimedBy }) => (
            <div
              key={_id}
              className="relative bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
            >
              {/* Item Image */}
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400 text-6xl">
                  <span>📦</span>
                </div>
              )}

              {/* Item Content */}
              <div className="flex-1 flex flex-col justify-between p-5">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {/* Title */}
                    <h2 className="text-xl font-semibold flex-1">{title}</h2>
                    {/* Date/Time */}
                    {createdAt && (
                      <span className="text-xs text-gray-500">
                        {format(new Date(createdAt), "PPpp")}
                      </span>
                    )}
                  </div>
                  {/* Status/Badge/Notice Section */}
                  <div className="mb-3 flex flex-col gap-1">
                    {/* Show proper status badge */}
                    {(() => {
                      if (status === "returned") {
                        return (
                          <span className="px-3 py-1 rounded-full bg-gray-300 text-gray-700 text-xs font-medium">
                            Returned
                          </span>
                        );
                      } else if (status === "claimed") {
                        return (
                          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                            Claimed
                          </span>
                        );
                      } else if (isApproved) {
                        return (
                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                            Approved
                          </span>
                        );
                      } else {
                        return (
                          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                            Pending Approval
                          </span>
                        );
                      }
                    })()}
                    {/* Pending notice */}
                    {!isApproved && (
                      <div className="text-xs text-yellow-700 bg-yellow-50 rounded px-2 py-1 mb-1">
                        Pending admin approval.<br />
                        Will appear on home after approval.
                      </div>
                    )}
                    {/* If returned, show destination/receiver */}
                    {status === "returned" && claimedBy && (
                      <div className="text-xs text-gray-600 bg-gray-100 rounded px-2 py-1 mt-1">
                        Returned to:{" "}
                        <span className="font-semibold">
                          {claimedBy.username || claimedBy.email || claimedBy._id}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delete button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => handleDelete(_id)}
                    disabled={deletingId === _id}
                    className={`px-4 py-2 rounded text-white mt-2 text-sm shadow
                      ${
                        deletingId === _id
                          ? "bg-red-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                  >
                    {deletingId === _id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
