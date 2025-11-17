// lib/stream-bus.ts
import { EventEmitter } from "events";

type ScreenEventPayload = {
  type: "menuUpdated" | "themeUpdated";
  screenId: string;
};

type ScreenEmitter = EventEmitter & {
  screenId: string;
};

const emitters = new Map<string, ScreenEmitter>();

export function getScreenEmitter(screenId: string): ScreenEmitter {
  let em = emitters.get(screenId);
  if (!em) {
    em = Object.assign(new EventEmitter(), { screenId });
    emitters.set(screenId, em);
  }
  return em;
}

export function broadcastUpdate(screenId: string, payload: ScreenEventPayload) {
  const em = getScreenEmitter(screenId);
  em.emit("update", payload);
}
