import React, { useState } from "react";
import {
  YStack,
  Card,
  Text,
  Button,
  Input,
  TextArea,
  Select,
  Separator,
} from "tamagui";

const TEST_EVENTS = [
  {
    label: "Text Message",
    value: "text_message",
    payload: {
      event: "message",
      data: {
        id: "test-message-id",
        from: "2348012345678@s.whatsapp.net",
        to: "2348087654321@s.whatsapp.net",
        type: "text",
        timestamp: Date.now(),
        content: {
          text: "Test webhook message"
        }
      },
      timestamp: Date.now()
    }
  },
  {
    label: "Image Message",
    value: "image_message",
    payload: {
      event: "message",
      data: {
        id: "test-image-id",
        from: "2348012345678@s.whatsapp.net",
        to: "2348087654321@s.whatsapp.net",
        type: "image",
        timestamp: Date.now(),
        content: {
          url: "https://example.com/test.jpg",
          caption: "Test image caption"
        }
      },
      timestamp: Date.now()
    }
  },
  {
    label: "Status Update",
    value: "status_update",
    payload: {
      event: "status",
      data: {
        id: "test-status-id",
        status: "delivered",
        timestamp: Date.now()
      },
      timestamp: Date.now()
    }
  },
  {
    label: "Contact Update",
    value: "contact_update",
    payload: {
      event: "contact",
      data: {
        id: "2348012345678@s.whatsapp.net",
        name: "Test Contact",
        pushname: "Test User",
        type: "individual",
        image: "https://example.com/avatar.jpg"
      },
      timestamp: Date.now()
    }
  }
];

export function WebhookTester() {
  const [selectedEvent, setSelectedEvent] = useState(TEST_EVENTS[0].value);
  const [customPayload, setCustomPayload] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    response?: any;
  } | null>(null);

  const handleTest = async (useCustomPayload: boolean = false) => {
    setLoading(true);
    setResult(null);

    try {
      let payload;
      if (useCustomPayload) {
        try {
          payload = JSON.parse(customPayload);
        } catch (e) {
          throw new Error("Invalid JSON in custom payload");
        }
      } else {
        payload = TEST_EVENTS.find(e => e.value === selectedEvent)?.payload;
        // Update timestamps to current time
        payload.timestamp = Date.now();
        if (payload.data.timestamp) {
          payload.data.timestamp = Date.now();
        }
      }

      const url = webhookUrl || "/api/webhook";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_WHAPI_ACCESS_TOKEN || ""}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      setResult({
        success: response.ok,
        message: response.ok ? "Webhook test successful" : "Webhook test failed",
        response: data
      });
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to test webhook"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card bordered padded elevate backgroundColor="$background">
      <YStack space="$4">
        <Text fontSize="$8" fontWeight="bold" textAlign="center" color="$color">
          Webhook Tester
        </Text>
        <Separator />

        <YStack space="$4">
          {/* Webhook URL Input */}
          <YStack space="$2">
            <Text fontSize="$4" fontWeight="bold" color="$color">
              Webhook URL
            </Text>
            <Input
              size="$4"
              placeholder="Enter webhook URL (optional, defaults to /api/webhook)"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
            />
          </YStack>

          {/* Test Event Selector */}
          <YStack space="$2">
            <Text fontSize="$4" fontWeight="bold" color="$color">
              Test Event
            </Text>
            <Select
              id="test-event"
              value={selectedEvent}
              onValueChange={setSelectedEvent}
            >
              <Select.Trigger width="100%" size="$4">
                <Select.Value placeholder="Select test event" />
              </Select.Trigger>

              <Select.Content>
                <Select.ScrollUpButton />
                <Select.Viewport>
                  <Select.Group>
                    <Select.Label>Test Events</Select.Label>
                    {TEST_EVENTS.map((event, index) => (
                      <Select.Item key={event.value} value={event.value} index={index}>
                        <Select.ItemText>{event.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Viewport>
                <Select.ScrollDownButton />
              </Select.Content>
            </Select>
          </YStack>

          {/* Custom Payload */}
          <YStack space="$2">
            <Text fontSize="$4" fontWeight="bold" color="$color">
              Custom Payload (Optional)
            </Text>
            <TextArea
              size="$4"
              placeholder="Enter custom JSON payload"
              value={customPayload}
              onChange={e => setCustomPayload(e.target.value)}
              minHeight={150}
            />
          </YStack>

          {/* Test Buttons */}
          <YStack space="$2">
            <Button
              size="$4"
              theme="active"
              onPress={() => handleTest(false)}
              disabled={loading}
            >
              {loading ? "Testing..." : "Test Predefined Event"}
            </Button>
            <Button
              size="$4"
              theme="blue"
              onPress={() => handleTest(true)}
              disabled={loading || !customPayload.trim()}
            >
              {loading ? "Testing..." : "Test Custom Payload"}
            </Button>
          </YStack>

          {/* Result Display */}
          {result && (
            <Card
              backgroundColor={result.success ? "$green2" : "$red2"}
              padding="$3"
            >
              <YStack space="$2">
                <Text
                  color={result.success ? "$green11" : "$red11"}
                  fontWeight="bold"
                >
                  {result.message}
                </Text>
                {result.response && (
                  <TextArea
                    size="$3"
                    value={JSON.stringify(result.response, null, 2)}
                    readOnly
                    minHeight={100}
                  />
                )}
              </YStack>
            </Card>
          )}
        </YStack>
      </YStack>
    </Card>
  );
} 