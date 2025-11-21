// components/HalloweenOverlay.tsx
"use client";

import { EmojiOverlay } from "./EmojiOverlay";

export function HalloweenOverlay() {
  return (
    <EmojiOverlay
      emojis={["🎃", "🕸️", "🕷️", "🦇"]}
      count={30}
      minDuration={9}
      maxDuration={18}
      minSize={16}
      maxSize={32}
    />
  );
}
