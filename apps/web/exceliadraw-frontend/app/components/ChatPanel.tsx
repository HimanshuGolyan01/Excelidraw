"use client";

import { useState } from "react";
import type { ChatMessage } from "../lib/types";

type ChatPanelProps = {
  messages: ChatMessage[];
  onSend: (message: string) => void;
};

export function ChatPanel({ messages, onSend }: ChatPanelProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg) return;
    onSend(msg);
    setInput("");
  };

  return (
    <div className="w-full lg:w-80 flex flex-col border-t lg:border-t-0">
      <h2 className="font-semibold p-4 border-b">Chat</h2>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[200px]">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm">No messages yet</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="border-l-2 border-gray-300 pl-2 text-sm">
              {m.message}
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border px-3 py-2 rounded text-sm"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
}
