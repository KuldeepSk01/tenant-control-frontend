import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";

export default function useNotifications(token) {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      console.warn("Notifications WebSocket not started: no access token.");
      return;
    }

    console.info("Connecting to notifications WebSocket...");

    const client = new Client({
      brokerURL: "ws://localhost:2027/ws",

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      reconnectDelay: 5000,

      debug: (message) => {
        console.log("[STOMP]", message);
      },

      onConnect: () => {
        console.log("WebSocket connected successfully");
        setConnected(true);

        client.subscribe(
          "/user/queue/notifications",
          (message) => {
            try {
              const notification = JSON.parse(message.body);

              console.log("Notification received:", message);

              setNotifications((previous) => [
                notification,
                ...previous,
              ]);
            } catch (error) {
              console.error("Notification parsing failed:", error);
            }
          }
        );
      },

      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers.message);
      },

      onWebSocketError: (error) => {
        console.error("WebSocket error:", error);
      },

      onWebSocketClose: (event) => {
        console.warn(
          "Notifications WebSocket closed:",
          event.code,
          event.reason || "No close reason provided",
        );
        setConnected(false);
      },
    });

    client.activate();

    return () => {
      void client.deactivate();
    };
  }, [token]);

  return { notifications, connected };
}