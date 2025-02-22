import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, message, type = 'text', options = {} } = body;

    if (!to) {
      return NextResponse.json(
        { error: 'Missing required field: to' },
        { status: 400 }
      );
    }

    // Format phone number if needed
    const formattedNumber = formatPhoneNumber(to);
    const recipient = `${formattedNumber}@s.whatsapp.net`;

    let endpoint = 'messages/text';
    let payload: any = {
      to: recipient,
    };

    switch (type) {
      case 'text':
        if (!message) {
          return NextResponse.json(
            { error: 'Message is required for text messages' },
            { status: 400 }
          );
        }
        endpoint = 'messages/text';
        payload.body = message;
        break;

      case 'image':
        endpoint = 'messages/image';
        if (!options.url && !options.base64) {
          return NextResponse.json(
            { error: 'Either image URL or base64 data is required' },
            { status: 400 }
          );
        }

        // For image messages, media should be a direct string (URL or base64)
        payload.media = options.url || options.base64;
        if (message) payload.caption = message;
        break;

      case 'document':
        endpoint = 'messages/document';
        if (!options.url && !options.base64) {
          return NextResponse.json(
            { error: 'Either document URL or base64 data is required' },
            { status: 400 }
          );
        }

        // For document messages, media should be a direct string (URL or base64)
        payload.media = options.url || options.base64;
        payload.filename = options.filename || 'document';
        if (message) payload.caption = message;
        break;

      case 'audio':
        endpoint = 'messages/audio';
        if (!options.url && !options.base64) {
          return NextResponse.json(
            { error: 'Either audio URL or base64 data is required' },
            { status: 400 }
          );
        }

        payload = {
          ...payload,
          media: options.url 
            ? { url: options.url }
            : { data: options.base64.split('base64,')[1] },
          mime_type: options.mimeType || 'audio/mpeg'
        };
        break;

      case 'location':
        if (!options.latitude || !options.longitude) {
          return NextResponse.json(
            { error: 'Latitude and longitude are required for location messages' },
            { status: 400 }
          );
        }
        endpoint = 'messages/location';
        payload = {
          ...payload,
          latitude: options.latitude,
          longitude: options.longitude,
          name: options.name || '',
          address: options.address || '',
        };
        break;

      case 'buttons':
        if (!message || !options.buttons || !options.buttons.length) {
          return NextResponse.json(
            { error: 'Message and buttons are required for button messages' },
            { status: 400 }
          );
        }
        endpoint = 'messages/buttons';
        payload = {
          ...payload,
          body: message,
          buttons: options.buttons.map((btn: string) => ({
            reply: {
              id: btn.toLowerCase().replace(/\s+/g, '_'),
              title: btn
            }
          }))
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Unsupported message type' },
          { status: 400 }
        );
    }

    console.log('Sending request to WhatsApp API:', {
      endpoint,
      payload: {
        ...payload,
        media: payload.media ? '[MEDIA_DATA]' : undefined
      }
    });

    const response = await fetch(`${process.env.WHAPI_GATEWAY_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHAPI_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('WhatsApp API Response:', data);

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${JSON.stringify(data)}`);
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message', details: error.message },
      { status: 500 }
    );
  }
}

function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Add country code (234 for Nigeria) if not present
  if (!cleaned.startsWith('234') && cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.substring(1);
  } else if (!cleaned.startsWith('234') && !cleaned.startsWith('0')) {
    cleaned = '234' + cleaned;
  }
  
  return cleaned;
} 