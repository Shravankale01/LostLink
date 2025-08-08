"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { Paperclip } from "lucide-react";
import Image from "next/image"; // Import Next.js Image component

interface ChatMessage {
  _id: string;
  sender?: {
    username: string;
  };
  text?: string;
  file?: string;
}

export default function ChatPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [itemTitle, setItemTitle] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMsg, setNewMsg] = useState<string>("");
  const [attachment, setAttachment] = useState<File | null>(null);

  // Get item title
  const fetchItemTitle = async () => {
    try {
      const res = await axios.get(`/api/items/${itemId}`);
      setItemTitle(res.data.item?.title || "Unknown Item");
    } catch {
      setItemTitle("Unknown Item");
    }
  };

  // Get chat messages
  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/api/chats/${itemId}`);
      setMessages(res.data.messages as ChatMessage[]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Failed to load messages:", error.message);
      } else {
        console.error("Failed to load messages:", error);
      }
    }
  };

  // Send a new message (with optional attachment)
  const sendMessage = async () => {
    if (!newMsg.trim() && !attachment) return;

    const formData = new FormData();
    formData.append("text", newMsg);
    if (attachment) formData.append("file", attachment);

    try {
      await axios.post(`/api/chats/${itemId}`, formData);
      setNewMsg("");
      setAttachment(null);
      await fetchMessages();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Failed to send message:", error.message);
      } else {
        console.error("Failed to send message:", error);
      }
    }
  };

  useEffect(() => {
    fetchItemTitle();
    fetchMessages();
    // eslint-disable-next-line
  }, [itemId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-xl rounded min-h-screen">
      {/* Back Button at the top */}
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
      >
        ← Back
      </button>

      <h2 className="text-3xl font-bold mb-6 text-blue-800">
        Chat for: <span className="text-gray-700">{itemTitle}</span>
      </h2>

      <div className="h-[28rem] overflow-y-auto border border-gray-300 rounded-lg bg-gray-50 p-4 mb-6 space-y-4">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className="bg-white p-3 rounded shadow-sm">
              <strong className="text-blue-700">{msg.sender?.username || "User"}:</strong>
              {msg.text && <p className="text-gray-700 mt-1">{msg.text}</p>}
              {msg.file && (
                <div className="mt-2">
                  {msg.file.endsWith(".pdf") ? (
                    <a
                      href={msg.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 underline"
                    >
                      📄 View PDF
                    </a>
                  ) : (
                    // Use Next.js Image component to optimize images instead of <img> tag
                    <Image
                      src={msg.file}
                      alt="Attachment"
                      width={128}
                      height={128}
                      className="rounded border mt-1"
                    />
                  )}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
          title="Attach file"
        >
          <Paperclip className="w-5 h-5 text-gray-700" />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => setAttachment(e.target.files?.[0] || null)}
          accept="image/*,.pdf"
          className="hidden"
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          Send
        </button>
      </div>

      {attachment && (
        <p className="text-sm text-gray-600 mt-2">
          📎 Attached: {attachment.name}
        </p>
      )}
    </div>
  );
}

