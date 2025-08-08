"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function AdminPage() {
  const [unapprovedItems, setUnapprovedItems] = useState<any[]>([]);
  const [approvedItems, setApprovedItems] = useState<any[]>([]);
  const [showApproved, setShowApproved] = useState(false);

  // Helper to get image URL from item object safely
  const resolveImage = (item: unknown) => {
    return (
      item.imageUrl ||
      (Array.isArray(item.images) && item.images[0]) ||
      item.image ||
      item.file ||
      null
    );
  };

  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await axios.post("/api/users/logout");
      if (res.status === 200) {
        toast.success("Logged out successfully!");
        setTimeout(() => {
          router.replace("/login");
        }, 400);
      } else {
        toast.error("Failed to logout");
      }
    } catch (err) {
      toast.error("Failed to logout");
    }
  };

  useEffect(() => {
    async function fetchItems() {
      try {
        const [unapprovedRes, approvedRes] = await Promise.all([
          fetch("/api/items/unapproved", { cache: "no-store" }),
          fetch("/api/items/approved", { cache: "no-store" }),
        ]);

        if (!unapprovedRes.ok || !approvedRes.ok) {
          console.error("Fetch error");
          return;
        }

        const unapprovedData = await unapprovedRes.json();
        const approvedData = await approvedRes.json();

        // Keep only claimed approved items
        const claimedApproved = (approvedData.items || []).filter(
          (item: unknown) => item.status === "claimed"
        );

        setUnapprovedItems(unapprovedData.items || []);
        setApprovedItems(claimedApproved);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    }

    fetchItems();
  }, []);

  const handleApprove = async (id: string) => {
    const res = await fetch(`/api/items/approve/${id}`, {
      method: "PATCH",
    });
    if (res.ok) {
      setUnapprovedItems((prev) => prev.filter((item) => item._id !== id));
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/items/status/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      // Refresh only claimed approved items
      const refresh = await fetch("/api/items/approved", { cache: "no-store" });
      const data = await refresh.json();
      const claimedApproved = (data.items || []).filter(
        (item: unknown) => item.status === "claimed"
      );
      setApprovedItems(claimedApproved);
    }
  };

  // New handler for unclaiming an item
  const handleUnclaim = async (id: string) => {
    const res = await fetch(`/api/items/unclaim/${id}`, {
      method: "PATCH",
    });
    if (res.ok) {
      // Refresh only claimed approved items
      const refresh = await fetch("/api/items/approved", { cache: "no-store" });
      const data = await refresh.json();
      const claimedApproved = (data.items || []).filter(
        (item: any) => item.status === "claimed"
      );
      setApprovedItems(claimedApproved);
      toast.success("Item set to found/unclaimed again.");
    } else {
      toast.error("Failed to unclaim item.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Logout button at top right */}
      <div className="fixed top-6 right-8 z-50">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white rounded px-4 py-2 font-semibold shadow hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
      {/* Sidebar */}
      <div className="w-64 bg-white border-r shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
        <button
          onClick={() => setShowApproved(false)}
          className={`w-full mb-3 py-2 px-4 rounded text-left font-medium transition ${
            !showApproved ? "bg-blue-600 text-white" : "hover:bg-gray-200"
          }`}
        >
          Unapproved Items
        </button>
        <button
          onClick={() => setShowApproved(true)}
          className={`w-full py-2 px-4 rounded text-left font-medium transition ${
            showApproved ? "bg-blue-600 text-white" : "hover:bg-gray-200"
          }`}
        >
          Manage Items
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">
          {showApproved ? "Manage Claimed Items" : "Items Awaiting Approval"}
        </h1>

        {showApproved ? (
          approvedItems.length === 0 ? (
            <p className="text-gray-600">No claimed approved items found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedItems.map((item: any) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-lg p-5 border border-gray-200 flex flex-col justify-between"
                >
                  {/* Image */}
                  <div className="mb-3 w-full h-48 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                    {resolveImage(item) ? (
                      <img
                        src={resolveImage(item)}
                        alt={item.title}
                        className="w-full h-full object-cover transition duration-200 hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const placeholder = e.currentTarget.nextSibling as HTMLElement;
                          if (placeholder) placeholder.style.display = "flex";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No Image Available
                      </div>
                    )}
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
                    <p className="text-sm text-gray-700 mb-1">{item.description}</p>
                    <p className="text-sm mb-1">
                      <span className="font-semibold">Status:</span> {item.status}
                    </p>
                    {item.claimedBy && (
                      <p className="text-sm mb-2">
                        <span className="font-semibold">Claimed by:</span>{" "}
                        {item.claimedBy.username || "Unknown"}
                      </p>
                    )}
                  </div>

                  {/* Action Section */}
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleStatusChange(item._id, "returned")}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex-1"
                      >
                        Mark Returned
                      </button>

                      {/* Chat button */}
                      {item.claimedBy && (
                        <Link href={`/chat/${item._id}`}>
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex-1">
                            💬 Chat
                          </button>
                        </Link>
                      )}
                    </div>
                    {/* Unclaim item button */}
                    <button
                      onClick={() => handleUnclaim(item._id)}
                      className="mt-2 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm w-full"
                    >
                      Unclaim Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : unapprovedItems.length === 0 ? (
          <p className="text-gray-600">No items pending approval.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unapprovedItems.map((item: any) => (
              <div
                key={item._id}
                className="bg-white rounded-lg shadow-lg p-5 border border-gray-200"
              >
                {/* Image */}
                <div className="mb-3 w-full h-48 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                  {resolveImage(item) ? (
                    <img
                      src={resolveImage(item)}
                      alt={item.title}
                      className="w-full h-full object-cover transition duration-200 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const placeholder = e.currentTarget.nextSibling as HTMLElement;
                        if (placeholder) placeholder.style.display = "flex";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No Image Available
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
                <p className="text-sm text-gray-700 mb-3">{item.description}</p>
                <button
                  onClick={() => handleApprove(item._id)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                >
                  Approve
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// "use client";
// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import { toast } from "react-hot-toast";


// export default function AdminPage() {
//   const [unapprovedItems, setUnapprovedItems] = useState<any[]>([]);
//   const [approvedItems, setApprovedItems] = useState<any[]>([]);
//   const [showApproved, setShowApproved] = useState(false);

//   // Helper to get image URL from item object safely
//   const resolveImage = (item: any) => {
//     return (
//       item.imageUrl ||
//       (Array.isArray(item.images) && item.images[0]) ||
//       item.image ||
//       item.file ||
//       null
//     );
//   };

//   const router = useRouter();

//   const handleLogout = async () => {
//       try {
//         const res = await axios.post("/api/users/logout");
//         if (res.status === 200) {
//           toast.success("Logged out successfully!");
//           setTimeout(() => {
//             router.replace("/login");
//           }, 400); // a short delay helps ensure toast and server sync
//         } else {
//           toast.error("Failed to logout");
//         }
//       } catch (err) {
//         toast.error("Failed to logout");
//       }
//     };
//   useEffect(() => {
//     async function fetchItems() {
//       try {
//         const [unapprovedRes, approvedRes] = await Promise.all([
//           fetch("/api/items/unapproved", { cache: "no-store" }),
//           fetch("/api/items/approved", { cache: "no-store" }),
//         ]);

//         if (!unapprovedRes.ok || !approvedRes.ok) {
//           console.error("Fetch error");
//           return;
//         }

//         const unapprovedData = await unapprovedRes.json();
//         const approvedData = await approvedRes.json();

//         // Keep only claimed approved items
//         const claimedApproved = (approvedData.items || []).filter(
//           (item: any) => item.status === "claimed"
//         );

//         setUnapprovedItems(unapprovedData.items || []);
//         setApprovedItems(claimedApproved);
//       } catch (error) {
//         console.error("Error fetching items:", error);
//       }
//     }

//     fetchItems();
//   }, []);

//   const handleApprove = async (id: string) => {
//     const res = await fetch(`/api/items/approve/${id}`, {
//       method: "PATCH",
//     });
//     if (res.ok) {
//       setUnapprovedItems((prev) => prev.filter((item) => item._id !== id));
//     }
//   };

//   const handleStatusChange = async (id: string, newStatus: string) => {
//     const res = await fetch(`/api/items/status/${id}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ status: newStatus }),
//     });

//     if (res.ok) {
//       // Refresh only claimed approved items
//       const refresh = await fetch("/api/items/approved", { cache: "no-store" });
//       const data = await refresh.json();
//       const claimedApproved = (data.items || []).filter(
//         (item: any) => item.status === "claimed"
//       );
//       setApprovedItems(claimedApproved);
//     }
//   };

//   return (

    

//     <div className="flex min-h-screen bg-gray-50 text-gray-900">
//       {/* Logout button at top right */}
//       <div className="fixed top-6 right-8 z-50">
//         <button
//           onClick={handleLogout}
//           className="bg-red-600 text-white rounded px-4 py-2 font-semibold shadow hover:bg-red-700 transition"
//         >
//           Logout
//         </button>
//       </div>
//       {/* Sidebar */}
//       <div className="w-64 bg-white border-r shadow-md p-6">
//         <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
//         <button
//           onClick={() => setShowApproved(false)}
//           className={`w-full mb-3 py-2 px-4 rounded text-left font-medium transition ${
//             !showApproved ? "bg-blue-600 text-white" : "hover:bg-gray-200"
//           }`}
//         >
//           Unapproved Items
//         </button>
//         <button
//           onClick={() => setShowApproved(true)}
//           className={`w-full py-2 px-4 rounded text-left font-medium transition ${
//             showApproved ? "bg-blue-600 text-white" : "hover:bg-gray-200"
//           }`}
//         >
//           Manage Items
//         </button>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 p-8">
//         <h1 className="text-3xl font-bold mb-6">
//           {showApproved ? "Manage Claimed Items" : "Items Awaiting Approval"}
//         </h1>

//         {showApproved ? (
//           approvedItems.length === 0 ? (
//             <p className="text-gray-600">No claimed approved items found.</p>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {approvedItems.map((item: any) => (
//                 <div
//                   key={item._id}
//                   className="bg-white rounded-lg shadow-lg p-5 border border-gray-200 flex flex-col justify-between"
//                 >
//                   {/* Image */}
//                   <div className="mb-3 w-full h-48 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
//                     {resolveImage(item) ? (
//                       <img
//                         src={resolveImage(item)}
//                         alt={item.title}
//                         className="w-full h-full object-cover transition duration-200 hover:scale-105"
//                         onError={(e) => {
//                           e.currentTarget.style.display = "none";
//                           const placeholder = e.currentTarget.nextSibling as HTMLElement;
//                           if (placeholder) placeholder.style.display = "flex";
//                         }}
//                       />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center text-gray-500">
//                         No Image Available
//                       </div>
//                     )}
//                   </div>

//                   <div>
//                     <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
//                     <p className="text-sm text-gray-700 mb-1">{item.description}</p>
//                     <p className="text-sm mb-1">
//                       <span className="font-semibold">Status:</span> {item.status}
//                     </p>
//                     {item.claimedBy && (
//                       <p className="text-sm mb-2">
//                         <span className="font-semibold">Claimed by:</span>{" "}
//                         {item.claimedBy.username || "Unknown"}
//                       </p>
//                     )}
//                   </div>

                  
//                   <div className="mt-4 flex flex-col gap-2">
//                     <div className="flex gap-2 flex-wrap">
//                       <button
//                         onClick={() => handleStatusChange(item._id, "returned")}
//                         className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex-1"
//                       >
//                         Mark Returned
//                       </button>

//                       {/* Chat button */}
//                       {item.claimedBy && (
//                         <Link href={`/chat/${item._id}`}>
//                           <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex-1">
//                             💬 Chat
//                           </button>
//                         </Link>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )
//         ) : unapprovedItems.length === 0 ? (
//           <p className="text-gray-600">No items pending approval.</p>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {unapprovedItems.map((item: any) => (
//               <div
//                 key={item._id}
//                 className="bg-white rounded-lg shadow-lg p-5 border border-gray-200"
//               >
//                 {/* Image */}
//                 <div className="mb-3 w-full h-48 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
//                   {resolveImage(item) ? (
//                     <img
//                       src={resolveImage(item)}
//                       alt={item.title}
//                       className="w-full h-full object-cover transition duration-200 hover:scale-105"
//                       onError={(e) => {
//                         e.currentTarget.style.display = "none";
//                         const placeholder = e.currentTarget.nextSibling as HTMLElement;
//                         if (placeholder) placeholder.style.display = "flex";
//                       }}
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center text-gray-500">
//                       No Image Available
//                     </div>
//                   )}
//                 </div>

//                 <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
//                 <p className="text-sm text-gray-700 mb-3">{item.description}</p>
//                 <button
//                   onClick={() => handleApprove(item._id)}
//                   className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
//                 >
//                   Approve
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

