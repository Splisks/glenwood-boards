// lib/sse.ts
// Very small in-memory SSE hub shared by /api/stream and other routes.

type Client = {
  id: string;
  screenId: string;
  controller: ReadableStreamDefaultController<Uint8Array>;
};

const clients: Client[] = [];

function send(controller: ReadableStreamDefaultController<Uint8Array>, data: any) {
  const text = `data: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(text));
}

export function addSseClient(screenId: string, controller: ReadableStreamDefaultController<Uint8Array>) {
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  clients.push({ id, screenId, controller });

  // optional hello event
  send(controller, { type: "connected", screenId });

  return id;
}

export function removeSseClient(id: string) {
  const idx = clients.findIndex((c) => c.id === id);
  if (idx !== -1) {
    clients.splice(idx, 1);
  }
}

/**
 * Broadcast "menuUpdated" to all screens (or a specific group if you add that later).
 * All your screens already listen for { type: "menuUpdated" } and call load().
 */
export function broadcastMenuUpdated(extra: Record<string, any> = {}) {
  const payload = { type: "menuUpdated", ...extra };
  const text = `data: ${JSON.stringify(payload)}\n\n`;
  const chunk = new TextEncoder().encode(text);

  for (const c of clients) {
    try {
      c.controller.enqueue(chunk);
    } catch (err) {
      // ignore broken connections
    }
  }
}
