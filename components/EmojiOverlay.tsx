// components/EmojiOverlay.tsx
"use client";

import { useMemo } from "react";

type EmojiOverlayProps = {
  emojis: string[];
  count?: number;
  minDuration?: number;
  maxDuration?: number;
  minSize?: number;
  maxSize?: number;
};

type EmojiParticle = {
  id: number;
  left: string;
  duration: number;
  delay: number;
  size: number;
  emoji: string;
};

export function EmojiOverlay({
  emojis,
  count = 40,
  minDuration = 8,
  maxDuration = 18,
  minSize = 10,
  maxSize = 24,
}: EmojiOverlayProps) {
  const particles = useMemo<EmojiParticle[]>(() => {
    const arr: EmojiParticle[] = [];
    const durSpan = maxDuration - minDuration;
    const sizeSpan = maxSize - minSize;

    for (let i = 0; i < count; i++) {
      const emoji = emojis[Math.floor(Math.random() * emojis.length)] ?? "❄";

      arr.push({
        id: i,
        left: `${Math.random() * 100}%`,
        duration: minDuration + Math.random() * durSpan,
        delay: Math.random() * maxDuration,
        size: minSize + Math.random() * sizeSpan,
        emoji,
      });
    }
    return arr;
  }, [emojis, count, minDuration, maxDuration, minSize, maxSize]);

  // IMPORTANT: use your existing snow-overlay / snowflake classes
  return (
    <div className="snow-overlay">
      {particles.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: flake.left,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
            fontSize: `${flake.size}px`,
          }}
        >
          {flake.emoji}
        </div>
      ))}
    </div>
  );
}
