"use client";
import { useEffect, useState } from "react";

export default function ChatBox({ itemId }: { itemId: string }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    async function fetchMessages() {
      const res = await fetch(`/api/chats/${itemId}`, { cache: "no-store" });
      const data = await res.json();
      setMessages(data.messages);
    }

    fetchMessages();
  }, [itemId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (text) formData.append("text", text);
    if (file) formData.append("file", file);

    const res = await fetch(`/api/chat/send`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const newMsg = await res.json();
      setMessages((prev) => [...prev, newMsg.message]);
      setText("");
      setFile(null);
    }
  };

  return (
    <div className="mt-4 border rounded p-4 bg-gray-50">
      <h3 className="font-bold mb-2">Chat</h3>
      <div className="max-h-60 overflow-y-auto space-y-2 mb-2">
        {messages.map((msg) => (
          <div key={msg._id} className="text-sm">
            <p><strong>{msg.sender.username || "User"}:</strong> {msg.text}</p>
            {msg.file && (
              <a href={msg.file} className="text-blue-500 underline" target="_blank">
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
