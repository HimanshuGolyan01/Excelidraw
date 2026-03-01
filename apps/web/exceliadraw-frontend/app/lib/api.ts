import { BACKEND_URL } from "../config";
import type { Stroke } from "./types";

export async function signup(username: string, password: string, name: string) {
  const res = await fetch(`${BACKEND_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, name }),
  });
  return res.json();
}

export async function signin(username: string, password: string) {
  const res = await fetch(`${BACKEND_URL}/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export async function createRoom(name: string, token: string) {
  const res = await fetch(`${BACKEND_URL}/room`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function getRoom(slug: string) {
  const res = await fetch(`${BACKEND_URL}/room/${slug}`);
  return res.json();
}

export async function getChats(roomId: number) {
  const res = await fetch(`${BACKEND_URL}/chats/${roomId}`);
  const data = await res.json();
  return (data.messages || []).reverse();
}

export async function sendChat(roomId: number, message: string, token: string) {
  const res = await fetch(`${BACKEND_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ roomId, message }),
  });
  return res.json();
}

export async function getDraw(roomId: number) {
  const res = await fetch(`${BACKEND_URL}/draw/${roomId}`);
  const data = await res.json();
  return (data.strokes || []) as Stroke[];
}

export async function saveDraw(roomId: number, strokes: Stroke[], token: string) {
  const res = await fetch(`${BACKEND_URL}/draw/${roomId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ strokes }),
  });
  return res.json();
}
