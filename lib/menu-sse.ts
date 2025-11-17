// lib/menu-sse.ts
// Tiny in-memory SSE client registry shared across routes.

type SSEClient = {
  id: number;
  send: (data: string) => void;
};

const globalObj = globalThis as any;

// Ensure we reuse the same Set across imports
if (!globalObj.__menuSseClients) {
  globalObj.__menuSseClients = new Set<SSEClient>();
}

const clients: Set<SSEClient> = globalObj.__menuSseClients;

export function addClient(client: SSEClient) {
  clients.add(client);
}

export function removeClient(client: SSEClient) {
  clients.delete(client);
}

export function broadcastMenuUpdated() {
  const payload = JSON.stringify({ type: "menuUpdated" });

  clients.forEach((client) => {
    try {
      client.send(payload);
    } catch {
      // ignore errors
    }
  });
}

