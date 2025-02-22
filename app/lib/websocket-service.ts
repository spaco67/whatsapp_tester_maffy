import { useWhatsAppStore } from "../store/whatsapp-store";

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000; // Start with 1 second

  constructor() {
    if (typeof window !== "undefined") {
      this.connect();
    }
  }

  private connect() {
    const token = process.env.WHAPI_ACCESS_TOKEN;
    if (!token) {
      console.error("WebSocket connection failed: No access token provided");
      return;
    }

    try {
      this.ws = new WebSocket(`wss://socket.whapi.cloud?token=${token}`);
      this.setupEventListeners();
    } catch (error) {
      console.error("WebSocket connection error:", error);
      this.handleReconnect();
    }
  }

  private setupEventListeners() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
      this.reconnectTimeout = 1000;
    };

    this.ws.onclose = () => {
      console.log("WebSocket disconnected");
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );

      setTimeout(() => {
        this.connect();
      }, this.reconnectTimeout);

      // Exponential backoff
      this.reconnectTimeout *= 2;
    } else {
      console.error(
        "Max reconnection attempts reached. Please refresh the page."
      );
      useWhatsAppStore
        .getState()
        .setError("Connection lost. Please refresh the page.");
    }
  }

  private handleWebSocketMessage(data: any) {
    const store = useWhatsAppStore.getState();

    switch (data.type) {
      case "message":
        // Handle new message
        const message = {
          id: data.message.id,
          from: data.message.from,
          to: data.message.to,
          type: data.message.type,
          timestamp: data.message.timestamp,
          content: data.message.content,
        };

        const contactId = data.message.from === "me" 
          ? data.message.to 
          : data.message.from.split("@")[0];

        store.addMessage(contactId, message);
        break;

      case "status":
        // Handle message status update
        console.log("Message status update:", data);
        break;

      case "presence":
        // Handle contact presence update
        console.log("Presence update:", data);
        break;

      default:
        console.log("Unknown message type:", data);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Create a singleton instance
export const websocketService = new WebSocketService(); 