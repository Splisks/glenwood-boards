// components/ValentinesHeartsOverlay.tsx
"use client";

import { EmojiOverlay } from "./EmojiOverlay";

export function ValentinesHeartsOverlay() {
  return (
    <EmojiOverlay
      emojis={["❤️", "💕", "💘", "💝"]}
      count={40}
      minDuration={10}
      maxDuration={20}
      minSize={14}
      maxSize={30}
    />
  );
}
