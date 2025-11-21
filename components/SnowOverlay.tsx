// components/SnowOverlay.tsx
"use client";

import { useMemo } from "react";

type Snowflake = {
  id: number;
  left: string;
  duration: number;
  delay: number;
  size: number;
};

const FLAKE_COUNT = 60;

export function SnowOverlay() {
  const flakes = useMemo<Snowflake[]>(() => {
    const arr: Snowflake[] = [];
    for (let i = 0; i < FLAKE_COUNT; i++) {
      arr.push({
        id: i,
        left: `${Math.random() * 100}%`,
        duration: 8 + Math.random() * 10, // 8 - 18 seconds
        delay: Math.random() * 10,
        size: 8 + Math.random() * 12, // px
      });
    }
    return arr;
  }, []);

  return (
    <div className="snow-overlay">
      {flakes.map((flake) => (
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
          ❄
        </div>
      ))}
    </div>
  );
}
