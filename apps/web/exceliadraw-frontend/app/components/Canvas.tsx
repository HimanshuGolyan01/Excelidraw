"use client";

import { useRef, useEffect, useCallback } from "react";
import type { Stroke } from "../lib/types";

type CanvasProps = {
  strokes: Stroke[];
  setStrokes: React.Dispatch<React.SetStateAction<Stroke[]>>;
  isHost: boolean;
  onSave: (strokes: Stroke[]) => void;
};

export function Canvas({ strokes, setStrokes, isHost, onSave }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<{ x: number; y: number }[]>([]);

  const getCoord = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const r = c.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isHost) return;
    const p = getCoord(e);
    currentStrokeRef.current = [p];
    setStrokes((prev) => [...prev, { points: [p] }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isHost || currentStrokeRef.current.length === 0) return;
    const p = getCoord(e);
    currentStrokeRef.current.push(p);
    setStrokes((prev) => {
      const next = [...prev];
      next[next.length - 1] = { points: [...currentStrokeRef.current] };
      return next;
    });
  };

  const handleMouseUp = useCallback(() => {
    if (!isHost) return;
    isDrawingRef.current = false;
    if (currentStrokeRef.current.length > 1) {
      const finalStrokes = [...strokes];
      finalStrokes[finalStrokes.length - 1] = { points: [...currentStrokeRef.current] };
      setStrokes(finalStrokes);
      onSave(finalStrokes);
    }
    currentStrokeRef.current = [];
  }, [isHost, onSave, strokes]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    strokes.forEach((s) => {
      if (s.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      s.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });
  }, [strokes]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-semibold">Canvas</h2>
        {isHost ? (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
            Host – you can draw
          </span>
        ) : (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            View only
          </span>
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className={`border bg-white max-w-full ${isHost ? "cursor-crosshair" : "cursor-default"}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
