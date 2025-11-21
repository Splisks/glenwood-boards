"use client";

import type { ThemeId } from "@/lib/themes";
import { SnowOverlay } from "@/components/SnowOverlay";
import { ValentinesHeartsOverlay } from "@/components/ValentinesHeartsOverlay";
import { HalloweenOverlay } from "@/components/HalloweenOverlay";
import { ThanksgivingLeavesOverlay } from "@/components/ThanksgivingLeavesOverlay";
import { NewYearsSparklesOverlay } from "@/components/NewYearsSparklesOverlay";

type Props = {
  themeId: ThemeId;
};

export function ThemeOverlay({ themeId }: Props) {
  switch (themeId) {
    case "christmas-classic":
      return <SnowOverlay />;

    case "valentines-pink":
      return <ValentinesHeartsOverlay />;

    case "halloween-spooky":
      return <HalloweenOverlay />;

    case "thanksgiving-harvest":
      return <ThanksgivingLeavesOverlay />;

    case "new-years-gold":
      return <NewYearsSparklesOverlay />;

    default:
      return null;
  }
}
