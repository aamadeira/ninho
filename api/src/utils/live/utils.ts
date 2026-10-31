import { Request, Response } from "express";

export type LiveTopic = "todos" | "shopping" | "recipes" | "events" | "users";

export class LiveUtils {
    private static readonly heartbeatIntervalInMilliseconds = 25000;
    private static clients: Set<Response> = new Set();

    public static subscribe(request: Request, response: Response): void {
        response.set({
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive"
        });
        response.flushHeaders();
        response.write(": connected\n\n");

        LiveUtils.clients.add(response);

        const heartbeat = setInterval(() => response.write(": heartbeat\n\n"), LiveUtils.heartbeatIntervalInMilliseconds);

        request.on("close", () => {
            clearInterval(heartbeat);
            LiveUtils.clients.delete(response);
        });
    }

    public static broadcast(topic: LiveTopic): void {
        const message = `data: ${JSON.stringify({ topic })}\n\n`;
        for (const client of LiveUtils.clients) {
            client.write(message);
        }
    }
}
