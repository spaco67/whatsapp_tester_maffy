import { NextResponse } from 'next/server';
import { WhapiWebhookSchema } from '@/app/types/whapi';
import { syncMessageToDb } from '@/app/lib/db';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  return handleMessageWebhook(request);
}

export async function PATCH(request: Request) {
  return handleMessageWebhook(request);
}

async function handleMessageWebhook(request: Request) {
  try {
    console.log('Message webhook received:', {
      method: request.method,
      headers: Object.fromEntries(request.headers),
    });

    const headersList = headers();
    const token = headersList.get('x-whapi-token') || headersList.get('authorization')?.split(' ')[1];
    
    if (!token || token !== process.env.WHAPI_ACCESS_TOKEN) {
      console.log('Token mismatch in message webhook:', {
        received: token,
        expected: process.env.WHAPI_ACCESS_TOKEN
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Message webhook body:', body);

    const webhook = WhapiWebhookSchema.safeParse(body);
    if (!webhook.success) {
      console.log('Invalid message webhook data:', webhook.error);
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 });
    }

    if (webhook.data.event !== 'message') {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    await syncMessageToDb(webhook.data.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Message webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 