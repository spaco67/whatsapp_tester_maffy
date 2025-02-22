import { z } from 'zod';

export const MessageTypeEnum = {
  text: 'text',
  image: 'image',
  document: 'document',
  audio: 'audio',
  video: 'video',
  location: 'location',
} as const;

export type MessageType = keyof typeof MessageTypeEnum;

export const WhapiMessageSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  type: z.enum(['text', 'image', 'document', 'audio', 'video', 'location']),
  timestamp: z.number(),
  content: z.any(), // Specific content type based on message type
});

export const WhapiContactSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  pushname: z.string().optional(),
  type: z.enum(['individual', 'group']),
  image: z.string().optional(),
});

export const WhapiWebhookSchema = z.object({
  event: z.string(),
  data: z.any(),
  timestamp: z.number(),
});

export type WhapiMessage = z.infer<typeof WhapiMessageSchema>;
export type WhapiContact = z.infer<typeof WhapiContactSchema>;
export type WhapiWebhook = z.infer<typeof WhapiWebhookSchema>;

export interface WhapiApiClient {
  sendMessage: (to: string, content: any, type: MessageType) => Promise<WhapiMessage>;
  getContacts: () => Promise<WhapiContact[]>;
  getMessages: (contact: string) => Promise<WhapiMessage[]>;
  downloadMedia: (messageId: string) => Promise<Blob>;
}

export interface DashboardStats {
  totalMessages: number;
  activeChats: number;
  pendingResponses: number;
  messageTypes: Record<MessageType, number>;
} 