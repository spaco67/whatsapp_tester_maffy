import { create } from 'zustand';

interface Contact {
  id: string;
  name?: string;
  pushname?: string;
  type: "individual" | "group";
  image?: string;
}

interface Message {
  id: string;
  from: string;
  to: string;
  type: "text" | "image" | "document" | "audio" | "location" | "buttons";
  timestamp: number;
  content: any;
}

interface Stats {
  totalMessages: number;
  activeChats: number;
  pendingResponses: number;
  messageTypes: Record<string, number>;
}

interface WhatsAppState {
  contacts: Contact[];
  selectedContact: Contact | null;
  messagesByContact: Record<string, Message[]>;
  stats: Stats;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setContacts: (contacts: Contact[]) => void;
  setSelectedContact: (contact: Contact | null) => void;
  setMessages: (contactId: string, messages: Message[]) => void;
  addMessage: (contactId: string, message: Message) => void;
  updateStats: (stats: Partial<Stats>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWhatsAppStore = create<WhatsAppState>((set) => ({
  contacts: [],
  selectedContact: null,
  messagesByContact: {},
  stats: {
    totalMessages: 0,
    activeChats: 0,
    pendingResponses: 0,
    messageTypes: {},
  },
  isLoading: false,
  error: null,

  setContacts: (contacts) => set({ contacts }),
  
  setSelectedContact: (contact) => set({ selectedContact: contact }),
  
  setMessages: (contactId, messages) =>
    set((state) => ({
      messagesByContact: {
        ...state.messagesByContact,
        [contactId]: messages,
      },
    })),
  
  addMessage: (contactId, message) =>
    set((state) => {
      const existingMessages = state.messagesByContact[contactId] || [];
      return {
        messagesByContact: {
          ...state.messagesByContact,
          [contactId]: [...existingMessages, message],
        },
        stats: {
          ...state.stats,
          totalMessages: state.stats.totalMessages + 1,
          messageTypes: {
            ...state.stats.messageTypes,
            [message.type]: (state.stats.messageTypes[message.type] || 0) + 1,
          },
        },
      };
    }),
  
  updateStats: (newStats) =>
    set((state) => ({
      stats: {
        ...state.stats,
        ...newStats,
      },
    })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
})); 