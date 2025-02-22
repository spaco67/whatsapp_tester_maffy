import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export async function syncContactToDb(contact: {
  id: string;
  name?: string;
  pushname?: string;
  type: string;
  image?: string;
}) {
  return prisma.contact.upsert({
    where: { whatsappId: contact.id },
    update: {
      name: contact.name,
      pushname: contact.pushname,
      type: contact.type,
      image: contact.image,
    },
    create: {
      whatsappId: contact.id,
      name: contact.name,
      pushname: contact.pushname,
      type: contact.type,
      image: contact.image,
    },
  });
}

export async function syncMessageToDb(message: {
  id: string;
  from: string;
  to: string;
  type: string;
  content: any;
  timestamp: number;
}) {
  // First, ensure we have the contact
  const contactId = message.from === 'me' ? message.to : message.from;
  const contact = await prisma.contact.findUnique({
    where: { whatsappId: contactId },
  });

  if (!contact) {
    throw new Error(`Contact not found: ${contactId}`);
  }

  return prisma.message.upsert({
    where: { whatsappId: message.id },
    update: {
      content: message.content,
      timestamp: message.timestamp,
    },
    create: {
      whatsappId: message.id,
      from: message.from,
      to: message.to,
      type: message.type,
      content: message.content,
      timestamp: message.timestamp,
      contactId: contact.id,
    },
  });
}

export async function updateStats(stats: {
  totalMessages?: number;
  activeChats?: number;
  pendingResponses?: number;
  messageTypes?: Record<string, number>;
}) {
  const statsDoc = await prisma.stats.findFirst();
  
  if (statsDoc) {
    return prisma.stats.update({
      where: { id: statsDoc.id },
      data: {
        ...stats,
        messageTypes: stats.messageTypes ? stats.messageTypes : undefined,
      },
    });
  }

  return prisma.stats.create({
    data: {
      totalMessages: stats.totalMessages || 0,
      activeChats: stats.activeChats || 0,
      pendingResponses: stats.pendingResponses || 0,
      messageTypes: stats.messageTypes || {},
    },
  });
} 