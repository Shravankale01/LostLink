"use client";
import { useEffect, useState } from "react";

interface ChatMessage {
  _id: string;
  sender: {
    username: string;
    // extend as needed
  };
  text?: string;
  file?: string;
}

export default function ChatBox({ itemId }: { itemId: string }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch(`/api/chats/${itemId}`, { cache: "no-store" });
        const data = await res.json();
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages as ChatMessage[]);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    }
    fetchMessages();
  }, [itemId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (text) formData.append("text", text);
    if (file) formData.append("file", file);

    try {
      const res = await fetch(`/api/chat/send`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const newMsg = await res.json();
        // Assuming newMsg.message is a ChatMessage:
        setMessages((prev) => [...prev, newMsg.message as ChatMessage]);
        setText("");
        setFile(null);
      } else {
        console.error("Failed to send message:", await res.text());
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="mt-4 border rounded p-4 bg-gray-50">
      <h3 className="font-bold mb-2">Chat</h3>
      <div className="max-h-60 overflow-y-auto space-y-2 mb-2">
        {messages.map((msg) => (
          <div key={msg._id} className="text-sm">
            <p>
              <strong>{msg.sender?.username || "User"}:</strong> {msg.text}
            </p>
            {msg.file && (
              <a
                href={msg.file}
                className="text-blue-500 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Attachment
              </a>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex gap-2 items-center">
        <input
          type="text"
          className="border rounded px-2 py-1 flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-sm"
        />
        <button
          type="submit"
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
}
