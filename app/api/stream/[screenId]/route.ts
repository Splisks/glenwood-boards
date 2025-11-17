import { NextRequest } from "next/server";
import { getScreenEmitter } from "@/lib/stream-bus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { screenId: string } }
) {
  const { screenId } = params;
  const emitter = getScreenEmitter(screenId);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        const chunk = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(chunk));
      };

      // confirm connection
      send({ type: "connected", screenId });

      const onUpdate = (payload: unknown) => {
        send(payload);
      };

      emitter.on("update", onUpdate);

      // keep the connection alive
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(`event: ping\ndata: ${Date.now()}\n\n`));
      }, 25000);

      const close = () => {
        clearInterval(keepAlive);
        emitter.off("update", onUpdate);
      };

      // cleanup when client disconnects
      // Next will call cancel when the connection closes
      (controller as any)._close = close;
    },
    cancel(reason) {
      const close = (this as any)._close as (() => void) | undefined;
      if (close) close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
