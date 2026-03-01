export type Stroke = { points: { x: number; y: number }[] };

export type ChatMessage = {
  id: number;
  message: string;
  userId: string;
};
