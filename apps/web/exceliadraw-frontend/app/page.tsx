"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "./hooks/useAuth";
import { AuthForm } from "./components/AuthForm";
import { RoomForm } from "./components/RoomForm";
import { SessionView } from "./components/SessionView";

export default function Home() {
  const searchParams = useSearchParams();
  const joinSlug = searchParams.get("join");
  const { token, userId, login, logout } = useAuth();
  const [view, setView] = useState<"auth" | "room" | "session">("auth");
  const [error, setError] = useState("");
  const [roomState, setRoomState] = useState<{
    roomId: number;
    roomSlug: string;
    isHost: boolean;
  } | null>(null);

  useEffect(() => {
    if (token) setView("room");
  }, [token]);

  const handleAuthSuccess = (newToken: string, newUserId?: string) => {
    login(newToken, newUserId);
    setView("room");
  };

  const handleCreateSuccess = (roomId: number, slug: string) => {
    setRoomState({ roomId, roomSlug: slug, isHost: true });
    setView("session");
  };

  const handleJoinSuccess = (roomId: number, slug: string, isHost: boolean) => {
    setRoomState({ roomId, roomSlug: slug, isHost });
    setView("session");
  };

  const handleBack = () => {
    setRoomState(null);
    setView("room");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-4 py-2 flex justify-between items-center">
        <h1 className="text-xl font-bold">ExcelDraw</h1>
        {token && (
          <button onClick={logout} className="text-sm text-gray-600 hover:underline">
            Logout
          </button>
        )}
      </header>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 text-center">{error}</div>
      )}

      {view === "auth" && <AuthForm onSuccess={handleAuthSuccess} />}

      {view === "room" && token && (
        <RoomForm
          token={token}
          userId={userId}
          initialJoinSlug={joinSlug ?? undefined}
          onJoinSuccess={handleJoinSuccess}
          onCreateSuccess={handleCreateSuccess}
        />
      )}

      {view === "session" && roomState && token && (
        <SessionView
          roomId={roomState.roomId}
          roomSlug={roomState.roomSlug}
          isHost={roomState.isHost}
          token={token}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
