"use client";

import { useState, useEffect } from "react";
import { createRoom, getRoom } from "../lib/api";

type RoomFormProps = {
  token: string;
  userId: string | null;
  initialJoinSlug?: string;
  onJoinSuccess: (roomId: number, slug: string, isHost: boolean) => void;
  onCreateSuccess: (roomId: number, slug: string) => void;
};

export function RoomForm({
  token,
  userId,
  initialJoinSlug,
  onJoinSuccess,
  onCreateSuccess,
}: RoomFormProps) {
  const [roomName, setRoomName] = useState("");
  const [roomSlug, setRoomSlug] = useState(initialJoinSlug ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialJoinSlug) setRoomSlug(initialJoinSlug);
  }, [initialJoinSlug]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await createRoom(roomName, token);
      if (data.roomId) {
        onCreateSuccess(data.roomId, roomName);
      } else {
        setError(data.message || "Error");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await getRoom(roomSlug);
      if (data.room) {
        onJoinSuccess(data.room.id, data.room.slug, data.room.adminId === userId);
      } else {
        setError("Room not found");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 max-w-md mx-auto w-full space-y-6">
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded">{error}</div>
      )}
      <form onSubmit={handleCreate} className="space-y-4">
        <h2 className="font-semibold">Create Room (you will be host & can draw)</h2>
        <input
          type="text"
          placeholder="Room name (3-20 chars)"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          minLength={3}
          maxLength={20}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "..." : "Create Room"}
        </button>
      </form>
      <form onSubmit={handleJoin} className="space-y-4">
        <h2 className="font-semibold">Join Room (chat only, host draws)</h2>
        <input
          type="text"
          placeholder="Room slug"
          value={roomSlug}
          onChange={(e) => setRoomSlug(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? "..." : "Join Room"}
        </button>
      </form>
    </div>
  );
}
