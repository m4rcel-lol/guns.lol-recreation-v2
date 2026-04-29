import { useEffect, useState } from "react";

export interface LanyardData {
  discord_user: {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
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
    const ws = new WebSocket("wss://api.lanyard.rest/socket");

    ws.onopen = () => {
      ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: discordId } }));
    };

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.t === "INIT_STATE" || payload.t === "PRESENCE_UPDATE") {
        setData(payload.d);
      }
    };

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ op: 3 }));
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      ws.close();
    };
  }, [discordId]);

  return data;
};
