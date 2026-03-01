"use client";

import { useState, useEffect, useCallback } from "react";
import { getChats, getDraw, sendChat, saveDraw } from "../lib/api";
import type { ChatMessage, Stroke } from "../lib/types";
import { Canvas } from "./Canvas";
import { ChatPanel } from "./ChatPanel";

type SessionViewProps = {
  roomId: number;
  roomSlug: string;
  isHost: boolean;
  token: string;
  onBack: () => void;
};

export function SessionView({
  roomId,
  roomSlug,
  isHost,
  token,
  onBack,
}: SessionViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [copied, setCopied] = useState(false);

  const fetchChats = useCallback(async () => {
    const msgs = await getChats(roomId);
    setMessages(msgs);
  }, [roomId]);

  const fetchDraw = useCallback(async () => {
    const s = await getDraw(roomId);
    setStrokes(s);
  }, [roomId]);

  const handleSendChat = async (message: string) => {
    await sendChat(roomId, message, token);
    fetchChats();
  };

  const handleSaveDraw = useCallback(
    async (strokesToSave: Stroke[]) => {
      await saveDraw(roomId, strokesToSave, token);
    },
    [roomId, token]
  );

  useEffect(() => {
    fetchChats();
    fetchDraw();
  }, [fetchChats, fetchDraw]);

  useEffect(() => {
    const t = setInterval(() => {
      fetchChats();
      if (!isHost) fetchDraw();
    }, 2000);
    return () => clearInterval(t);
  }, [fetchChats, fetchDraw, isHost]);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/room/${roomSlug}`
      : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r flex flex-col items-center">
          {isHost && (
            <div className="w-full max-w-[600px] mb-3 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Share room:</span>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1 min-w-0 truncate">
                {shareUrl}
              </code>
              <button
                onClick={copyLink}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 whitespace-nowrap"
              >
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          )}
          <Canvas
            strokes={strokes}
            setStrokes={setStrokes}
            isHost={isHost}
            onSave={handleSaveDraw}
          />
        </div>
        <ChatPanel messages={messages} onSend={handleSendChat} />
      </div>
      <div className="p-2 border-t">
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:underline"
        >
          ← Back to rooms
        </button>
      </div>
    </div>
  );
}
