import { NextResponse } from 'next/server';
import { WhapiWebhookSchema } from '@/app/types/whapi';
import { syncContactToDb } from '@/app/lib/db';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  return handleContactWebhook(request);
}

export async function PATCH(request: Request) {
  return handleContactWebhook(request);
}

async function handleContactWebhook(request: Request) {
  try {
    console.log('Contact webhook received:', {
      method: request.method,
      headers: Object.fromEntries(request.headers),
    });

    const headersList = headers();
    const token = headersList.get('x-whapi-token') || headersList.get('authorization')?.split(' ')[1];
    
    if (!token || token !== process.env.WHAPI_ACCESS_TOKEN) {
      console.log('Token mismatch in contact webhook:', {
        received: token,
        expected: process.env.WHAPI_ACCESS_TOKEN
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Contact webhook body:', body);

    const webhook = WhapiWebhookSchema.safeParse(body);
    if (!webhook.success) {
      console.log('Invalid contact webhook data:', webhook.error);
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 });
    }

    if (webhook.data.event !== 'contact') {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    await syncContactToDb(webhook.data.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 