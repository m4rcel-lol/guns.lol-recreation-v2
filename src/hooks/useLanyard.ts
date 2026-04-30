import { useEffect, useState, useRef } from "react";

export interface LanyardData {
  discord_user: {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
    global_name?: string;
  };
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: any[];
  listening_to_spotify: boolean;
  spotify: {
    track_id: string;
    timestamps: { start: number; end: number };
    song: string;
    artist: string;
    album_art_url: string;
    album: string;
  } | null;
}

export const useLanyard = (discordId: string) => {
  const [data, setData] = useState<LanyardData | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let pingInterval: NodeJS.Timeout;
    let reconnectTimeout: NodeJS.Timeout;
    let isMounted = true;

    const connect = () => {
      if (ws) {
        ws.close();
      }
      ws = new WebSocket("wss://api.lanyard.rest/socket");

      ws.onopen = () => {
        if (!isMounted) {
          ws?.close();
          return;
        }
        ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: discordId } }));
        clearInterval(pingInterval);
        pingInterval = setInterval(() => {
          if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ op: 3 }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const payload = JSON.parse(event.data);
          if (payload.t === "INIT_STATE" || payload.t === "PRESENCE_UPDATE") {
            setData(payload.d);
          }
        } catch (e) {
          console.error("Lanyard error", e);
        }
      };

      ws.onclose = () => {
        clearInterval(pingInterval);
        if (isMounted) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => {
        ws?.close();
      };
    };

    connect();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (!ws || ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
          clearTimeout(reconnectTimeout);
          connect();
        } else {
          // If the socket was in a stale state but didn't fire close, we can send a heartbeat or just reconnect
          // Reconnecting ensures fresh data if the connection was quietly dropped
          // We will just let the next ping fail if it's dead, and close.
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ op: 3 }));
          }
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(pingInterval);
      clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [discordId]);

  return data;
};
