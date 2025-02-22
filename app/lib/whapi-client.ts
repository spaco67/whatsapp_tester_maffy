import { MessageType, WhapiApiClient, WhapiMessage, WhapiContact } from '../types/whapi';

class WhapiClient {
  private baseUrl: string;
  private accessToken: string;

  constructor() {
    this.baseUrl = process.env.WHAPI_GATEWAY_URL || "https://gate.whapi.cloud";
    this.accessToken = process.env.WHAPI_ACCESS_TOKEN || "";
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Authorization": `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Log the complete error response for debugging
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data
        });

        // Extract error message from various possible formats
        const errorMessage = 
          typeof data.error === 'string' ? data.error :
          data.error?.message ? data.error.message :
          data.message ? data.message :
          `API Error: ${response.statusText}`;

        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      // Log the complete error for debugging
      console.error('Request Error:', error);

      // If it's already an Error instance, rethrow it
      if (error instanceof Error) {
        throw error;
      }

      // Otherwise, wrap it in an Error
      throw new Error('Failed to make API request');
    }
  }

  async getContacts() {
    const response = await this.request<{
      contacts: Array<{
        id: string;
        name?: string;
        pushname?: string;
        type: "individual" | "group";
        image?: string;
      }>;
    }>("/contacts");
    return response.contacts;
  }

  async getMessages(contactId: string) {
    const response = await this.request<{
      messages: Array<{
        id: string;
        from: string;
        to: string;
        type: string;
        timestamp: number;
        content: any;
      }>;
    }>(`/messages/${contactId}`);
    return response.messages;
  }

  async sendText(to: string, text: string) {
    return this.request("/messages/text", {
      method: "POST",
      body: JSON.stringify({
        to: to.includes("@s.whatsapp.net") ? to : `${to}@s.whatsapp.net`,
        body: text,
      }),
    });
  }

  async sendImage(to: string, media: string, caption?: string) {
    return this.request("/messages/image", {
      method: "POST",
      body: JSON.stringify({
        to: to.includes("@s.whatsapp.net") ? to : `${to}@s.whatsapp.net`,
        media,
        caption,
      }),
    });
  }

  async sendDocument(to: string, media: string, filename: string, caption?: string) {
    return this.request("/messages/document", {
      method: "POST",
      body: JSON.stringify({
        to: to.includes("@s.whatsapp.net") ? to : `${to}@s.whatsapp.net`,
        media,
        filename,
        caption,
      }),
    });
  }

  async sendLocation(
    to: string,
    latitude: number,
    longitude: number,
    name?: string,
    address?: string
  ) {
    return this.request("/messages/location", {
      method: "POST",
      body: JSON.stringify({
        to: to.includes("@s.whatsapp.net") ? to : `${to}@s.whatsapp.net`,
        latitude,
        longitude,
        name,
        address,
      }),
    });
  }

  async sendButtons(to: string, body: string, buttons: string[]) {
    return this.request("/messages/buttons", {
      method: "POST",
      body: JSON.stringify({
        to: to.includes("@s.whatsapp.net") ? to : `${to}@s.whatsapp.net`,
        body,
        buttons: buttons.map((btn) => ({
          reply: {
            id: btn.toLowerCase().replace(/\s+/g, "_"),
            title: btn,
          },
        })),
      }),
    });
  }

  async createGroup(name: string, participants: string[]) {
    return this.request("/groups", {
      method: "POST",
      body: JSON.stringify({
        name,
        participants: participants.map(p => 
          p.includes("@s.whatsapp.net") ? p : `${p}@s.whatsapp.net`
        ),
      }),
    });
  }

  async addParticipantsToGroup(groupId: string, participants: string[]) {
    return this.request(`/groups/${groupId}/participants`, {
      method: "POST",
      body: JSON.stringify({
        participants: participants.map(p => 
          p.includes("@s.whatsapp.net") ? p : `${p}@s.whatsapp.net`
        ),
      }),
    });
  }

  async removeParticipantsFromGroup(groupId: string, participants: string[]) {
    return this.request(`/groups/${groupId}/participants`, {
      method: "DELETE",
      body: JSON.stringify({
        participants: participants.map(p => 
          p.includes("@s.whatsapp.net") ? p : `${p}@s.whatsapp.net`
        ),
      }),
    });
  }
}

export const whapiClient = new WhapiClient(); 