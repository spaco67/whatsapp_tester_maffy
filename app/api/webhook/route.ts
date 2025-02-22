import { NextResponse } from 'next/server';
import { WhapiWebhookSchema } from '@/app/types/whapi';
import { syncContactToDb, syncMessageToDb, updateStats } from '@/app/lib/db';
import { headers } from 'next/headers';

// Verify webhook signature
function verifyWebhook(headersList: Headers, body: string): boolean {
  const token = headersList.get('x-whapi-token') || headersList.get('authorization')?.split(' ')[1];
  
  if (!token) {
    console.warn('⚠️ No webhook token found in headers');
    return false;
  }

  if (token !== process.env.WHAPI_ACCESS_TOKEN) {
    console.warn('⚠️ Webhook token mismatch', {
      received: token,
      expected: process.env.WHAPI_ACCESS_TOKEN?.slice(0, 10) + '...'
    });
    return false;
  }

  return true;
}

// Handle all HTTP methods
export async function POST(request: Request) {
  return handleWebhook(request);
}

export async function GET(request: Request) {
  // Handle webhook verification
  const headersList = headers();
  const challenge = headersList.get('x-whapi-challenge');
  
  if (challenge) {
    console.log('🔄 Webhook verification challenge received:', challenge);
    return NextResponse.json({ challenge });
  }
  
  return NextResponse.json({ status: 'ok' });
}

async function handleWebhook(request: Request) {
  const headersList = headers();
  const allHeaders = Object.fromEntries(headersList.entries());
  
  console.log('📥 Incoming Webhook:', {
    method: request.method,
    url: request.url,
    headers: {
      ...allHeaders,
      authorization: allHeaders.authorization ? '[REDACTED]' : undefined,
      'x-whapi-token': allHeaders['x-whapi-token'] ? '[REDACTED]' : undefined
    }
  });

  try {
    // Get and log the raw body
    const rawBody = await request.text();
    console.log('📦 Raw webhook payload:', rawBody);

    // Verify webhook signature
    if (!verifyWebhook(headersList, rawBody)) {
      console.error('❌ Webhook verification failed');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    // Parse the body
    let body;
    try {
      body = JSON.parse(rawBody);
      console.log('✅ Parsed webhook payload:', body);
    } catch (e) {
      console.error('❌ Failed to parse webhook body:', e);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Validate webhook data
    const webhook = WhapiWebhookSchema.safeParse(body);
    if (!webhook.success) {
      console.error('❌ Invalid webhook data:', webhook.error);
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 });
    }

    // Process webhook based on event type
    switch (webhook.data.event) {
      case 'message':
        console.log('📨 Processing message event:', webhook.data.data);
        await syncMessageToDb(webhook.data.data);
        break;
      
      case 'status':
        console.log('📊 Processing status event:', webhook.data.data);
        // Handle status updates
        break;
      
      case 'contact':
        console.log('👤 Processing contact event:', webhook.data.data);
        await syncContactToDb(webhook.data.data);
        break;
      
      default:
        console.log('ℹ️ Unhandled event type:', webhook.data.event);
    }

    return NextResponse.json({ 
      success: true,
      message: `Webhook processed: ${webhook.data.event}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Webhook processing error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json({ 
      success: false,
      error: 'Webhook processing failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 