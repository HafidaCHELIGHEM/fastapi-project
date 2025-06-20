// src/utils/websocketConnection.js – improved error handling & duplicate‑connect guard
import { useEffect, useState, useRef } from "react";

export function useWebSocketConnection() {
  /** ------------------------------------------------------------------
   *  REACT  STATE
   * ------------------------------------------------------------------ */
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [data, setData] = useState({
    cold_spray: [],
    notifications: [],
  });
  const [micData0, setMicData0] = useState([]);
  const [micData1, setMicData1] = useState([]);
  const [filterDate, setFilterDate] = useState(null);
  const [isRealTime, setIsRealTime] = useState(true);
  const [maintenanceRequired, setMaintenanceRequired] = useState(false);

  /** ------------------------------------------------------------------
   *  REFS (they stay the same across renders)
   * ------------------------------------------------------------------ */
  const ws                = useRef(null);
  const reconnectTimeout  = useRef(null);
  const reconnectAttempts = useRef(0);
  const pingInterval      = useRef(null);

  /** ------------------------------------------------------------------
   *  CONNECT  /  RECONNECT  WEBSOCKET
   * ------------------------------------------------------------------ */
  const connectWebSocket = () => {
    // 👉 Prevent duplicate connections (OPEN / CONNECTING)
    if (
      ws.current &&
      (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)
    ) {
      console.log("WebSocket already open / connecting – aborting duplicate attempt");
      return;
    }

    // 🔄 Clear any previous keep‑alive ping
    if (pingInterval.current) clearInterval(pingInterval.current);

    console.log("Attempting to connect to WebSocket server…");

    try {
      ws.current = new WebSocket("ws://localhost:8000/ws");

      /* ----------------------------  OPEN  --------------------------- */
      ws.current.onopen = () => {
        console.log("✅ Connected to WebSocket server");
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;

        // Keep‑alive ping every 30 s
        pingInterval.current = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(
              JSON.stringify({ type: "ping", timestamp: new Date().toISOString() })
            );
          }
        }, 30000);
      };

      /* ---------------------------  MESSAGE  ------------------------- */
      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          // Ignore ping/pong from server
          if (message.type === "ping" || message.type === "pong") return;

          // Notifications ------------------------------------------------
          if (message.notifications) {
            console.log("Received notifications data");
            setData((prev) => ({ ...prev, notifications: message.notifications }));
            setIsLoading(false);
            setLastUpdated(new Date().toLocaleTimeString());
            return;
          }

          // Combined data format ----------------------------------------
          if (message.cold_spray) {
            console.log("Received combined data");

            if (Array.isArray(message.cold_spray) && message.cold_spray.length) {
              setData((prev) => ({ ...prev, cold_spray: message.cold_spray }));
            }

            if (Array.isArray(message.micro_0) && message.micro_0.length) {
              setMicData0((prev) => [...prev, ...message.micro_0].slice(-10));
            }
            if (Array.isArray(message.micro_1) && message.micro_1.length) {
              setMicData1((prev) => [...prev, ...message.micro_1].slice(-10));
            }

            setIsLoading(false);
            setLastUpdated(new Date().toLocaleTimeString());
            return;
          }

          // Maintenance flag -------------------------------------------
          if (Object.prototype.hasOwnProperty.call(message, "maintenance_required")) {
            console.log("Received maintenance data");
            setMaintenanceRequired(Boolean(message.maintenance_required));
            return;
          }

          // Legacy array format ----------------------------------------
          if (Array.isArray(message)) {
            if (message.length) {
              console.log(`Received ${message.length} legacy data points`);
              setData((prev) => ({ ...prev, cold_spray: message }));
              setIsLoading(false);
              setLastUpdated(new Date().toLocaleTimeString());
            } else {
              console.log("Received empty legacy data array");
            }
          }
        } catch (err) {
          console.error("Error processing message:", err);
        }
      };

      /* -----------------------------  CLOSE  ------------------------- */
      ws.current.onclose = (event) => {
        console.log(
          `WebSocket closed with code ${event.code}. Reason: ${event.reason || "Unknown"}`
        );
        setIsConnected(false);

        if (pingInterval.current) clearInterval(pingInterval.current);
        if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);

        if (!navigator.onLine) {
          setError("Network offline. Will reconnect when your internet connection is restored.");
          return;
        }

        // Exponential back‑off reconnect (max 30 s)
        const delay = Math.min(30000, 2 ** reconnectAttempts.current * 1000);
        reconnectAttempts.current += 1;
        console.log(`Will attempt to reconnect in ${delay / 1000} seconds…`);
        reconnectTimeout.current = setTimeout(connectWebSocket, delay);
      };

      /* -----------------------------  ERROR  ------------------------- */
      ws.current.onerror = (event) => {
        const detail = event?.message || event?.reason || "Unknown error";
        console.error("WebSocket error:", detail, event);
        setError(`WebSocket error${detail !== "Unknown error" ? `: ${detail}` : ""}. Please check if the server is running.`);
        setIsConnected(false);
      };
    } catch (err) {
      console.error("Error creating WebSocket:", err);
      setError("Failed to create WebSocket connection. Please check your network connection.");
      setIsConnected(false);

      const delay = Math.min(30000, 2 ** reconnectAttempts.current * 1000);
      reconnectAttempts.current += 1;
      reconnectTimeout.current = setTimeout(connectWebSocket, delay);
    }
  };

  /** ------------------------------------------------------------------
   *  SEND FILTER – whenever filterDate or connection status changes
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (!isConnected || ws.current?.readyState !== WebSocket.OPEN) return;

    const payload = filterDate
      ? { filter_date: filterDate.toLocaleDateString()}
      : { filter_date: null };

    console.log("Sending filter payload:", payload);
    ws.current.send(JSON.stringify(payload));
  }, [filterDate, isConnected]);

  /** ------------------------------------------------------------------
   *  PUBLIC  HELPERS
   * ------------------------------------------------------------------ */
  const handleDateChange = (date) => {
    setFilterDate(date);
    setIsRealTime(date === null);
  };

  const handleReconnect = () => {
    setIsLoading(true);
    setError(null);
    connectWebSocket();
  };

  /** ------------------------------------------------------------------
   *  ONLINE / OFFLINE  
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const handleOnline = () => {
      console.log("Browser is online → reconnecting…");
      setError(null);
      connectWebSocket();
    };

    const handleOffline = () => {
      console.log("Browser is offline");
      setError("Network offline. Will reconnect when your internet connection is restored.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  /** ------------------------------------------------------------------
   *  INITIAL  CONNECT  (on mount)
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (navigator.onLine) {
      connectWebSocket();
    } else {
      setError("Network offline. Will connect when your internet connection is available.");
    }

    return () => {
      if (pingInterval.current) clearInterval(pingInterval.current);
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (ws.current) ws.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** ------------------------------------------------------------------
   *  EXPOSE API
   * ------------------------------------------------------------------ */
  return {
    isConnected,
    isLoading,
    error,
    lastUpdated,
    data,
    micData0,
    micData1,
    filterDate,
    isRealTime,
    handleDateChange,
    handleReconnect,
    maintenanceRequired,
  };
}
