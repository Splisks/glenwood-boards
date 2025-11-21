// components/NewYearsSparklesOverlay.tsx
"use client";

import { EmojiOverlay } from "./EmojiOverlay";

export function NewYearsSparklesOverlay() {
  return (
    <EmojiOverlay
      emojis={["✨", "⭐", "🎉", "🎊"]}
      count={50}
      minDuration={8}
      maxDuration={16}
      minSize={12}
      maxSize={26}
    />
  );
}
