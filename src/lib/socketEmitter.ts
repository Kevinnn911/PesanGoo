// File: src/lib/socketEmitter.ts

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
const SOCKET_SERVER_SECRET = process.env.SOCKET_SERVER_SECRET || "pesengo_socket_secret_2026";

export async function emitSocketEvent(event: string, data: unknown): Promise<void> {
  try {
    const response = await fetch(`${SOCKET_SERVER_URL}/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SOCKET_SERVER_SECRET}`,
      },
      body: JSON.stringify({ event, data }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Socket emit failed [${response.status}]: ${errorBody}`);
    }
  } catch (error) {
    // Non-blocking: log but do not throw so API responses still succeed
    console.error("Socket emit error (non-blocking):", error);
  }
}
