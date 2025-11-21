// components/ThanksgivingLeavesOverlay.tsx
"use client";

import { EmojiOverlay } from "./EmojiOverlay";

export function ThanksgivingLeavesOverlay() {
  return (
    <EmojiOverlay
      emojis={["🍂", "🍂", "🍁", "🍁"]}
      count={28}
      minDuration={10}
      maxDuration={22}
      minSize={16}
      maxSize={30}
    />
  );
}
