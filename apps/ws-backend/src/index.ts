import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

// ✅ Verify JWT & return userId
function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded?.userId) {
      return null;
    }

    return decoded.userId;
  } catch {
    return null;
  }
}

// ✅ New WebSocket connection
wss.on("connection", (ws, request) => {
  const url = request.url;
  if (!url) return;

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") ?? "";

  const userId = checkUser(token);

  if (!userId) {
    ws.close();
    return;
  }

  users.push({
    ws,
    userId,
    rooms: [],
  });

  console.log("User connected:", userId);

  // ✅ Message handler (MUST be inside connection)
  ws.on("message", async (data) => {
    const parsedData = JSON.parse(data.toString());

    const user = users.find((u) => u.ws === ws);
    if (!user) return;

    // ✅ Join room
    if (parsedData.type === "join-room") {
      if (!user.rooms.includes(parsedData.roomId)) {
        user.rooms.push(parsedData.roomId);
      }
      return;
    }

    // ✅ Chat message
    if (parsedData.type === "chat") {
      const { roomId, message } = parsedData;

      await prismaClient.chat.create({
        data: {
          roomId: Number(roomId),
          message,
          userId: user.userId,
        },
      });

      // Broadcast to users in same room
      users.forEach((u) => {
        if (u.rooms.includes(roomId)) {
          u.ws.send(
            JSON.stringify({
              type: "chat",
              roomId,
              message,
              userId: user.userId,
            })
          );
        }
      });
    }
  });

  ws.on("close", () => {
    const index = users.findIndex((u) => u.ws === ws);
    if (index !== -1) users.splice(index, 1);
    console.log("User disconnected:", userId);
  });
});
