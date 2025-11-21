// components/FloatingOverlay.tsx
"use client";

import { useMemo } from "react";

type Particle = {
  id: number;
  left: string;
  duration: number;
  delay: number;
  size: number;
  emoji: string;
};

type FloatingOverlayProps = {
  emojis: string[];
  count?: number;
  minDuration?: number;
  maxDuration?: number;
  minSize?: number;
  maxSize?: number;
  className?: string;
};

export function FloatingOverlay({
  emojis,
  count = 40,
  minDuration = 8,
  maxDuration = 16,
  minSize = 10,
  maxSize = 26,
  className,
}: FloatingOverlayProps) {
  const particles = useMemo<Particle[]>(() => {
    const arr: Particle[] = [];
    const span = maxDuration - minDuration;
    const sizeSpan = maxSize - minSize;

    for (let i = 0; i < count; i++) {
      const emoji = emojis[Math.floor(Math.random() * emojis.length)] ?? "❄";

      arr.push({
        id: i,
        left: `${Math.random() * 100}%`,
        duration: minDuration + Math.random() * span,
        delay: Math.random() * maxDuration,
        size: minSize + Math.random() * sizeSpan,
        emoji,
      });
    }
    return arr;
  }, [emojis, count, minDuration, maxDuration, minSize, maxSize]);

  return (
    <div className={`holiday-overlay ${className ?? ""}`}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="holiday-icon"
          style={{
            left: p.left,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            fontSize: `${p.size}px`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}
