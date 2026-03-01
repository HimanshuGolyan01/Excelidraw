"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRoom } from "../../lib/api";
import { SessionView } from "../../components/SessionView";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [room, setRoom] = useState<{ id: number; slug: string; adminId: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      router.replace("/");
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

    if (!token) {
      router.replace(`/?join=${slug}`);
      return;
    }

    const load = async () => {
      const data = await getRoom(slug);
      if (data.room) {
        setRoom(data.room);
      } else {
        router.replace("/");
      }
      setLoading(false);
    };

    load();
  }, [slug, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Joining room...</p>
      </div>
    );
  }

  if (!room) return null;

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const isHost = room.adminId === userId;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-4 py-2 flex justify-between items-center">
        <h1 className="text-xl font-bold">ExcelDraw</h1>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-gray-600 hover:underline"
        >
          ← Home
        </button>
      </header>
      <SessionView
        roomId={room.id}
        roomSlug={room.slug}
        isHost={isHost}
        token={typeof window !== "undefined" ? localStorage.getItem("token")! : ""}
        onBack={() => router.push("/")}
      />
    </div>
  );
}
