"use client";

import { useState, useCallback } from "react";
import {
  XStack,
  YStack,
  Input,
  Button,
  Text,
  Select,
  Separator,
  Card,
  Label,
  Switch,
  Tabs,
} from "tamagui";
import { GroupManager } from "../components/groups/GroupManager";
import { WebhookTester } from "../components/webhook/WebhookTester";

type MessageType =
  | "text"
  | "image"
  | "document"
  | "audio"
  | "location"
  | "buttons";
type UploadMethod = "url" | "file";

export default function TestPage() {
  return (
    <YStack padding="$4" space="$4">
      <Tabs defaultValue="messages" orientation="horizontal">
        <Tabs.List>
          <Tabs.Trigger value="messages">
            <Text>Message Tester</Text>
          </Tabs.Trigger>
          <Tabs.Trigger value="groups">
            <Text>Group Manager</Text>
          </Tabs.Trigger>
          <Tabs.Trigger value="webhooks">
            <Text>Webhook Tester</Text>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="messages">
          <MessageTester />
        </Tabs.Content>

        <Tabs.Content value="groups">
          <GroupManager />
        </Tabs.Content>

        <Tabs.Content value="webhooks">
          <WebhookTester />
        </Tabs.Content>
      </Tabs>
    </YStack>
  );
}

function MessageTester() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("text");
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>("url");
  const [options, setOptions] = useState({
    url: "",
    filename: "",
    latitude: "",
    longitude: "",
    name: "",
    address: "",
    buttons: [""] as string[],
    base64: "",
    mimeType: "",
  });
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [loading, setLoading] = useState(false);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        // Read file as base64
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          setOptions((prev) => ({
            ...prev,
            base64: base64, // Store the complete base64 string
            mimeType: file.type,
            filename: file.name,
          }));
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error reading file:", error);
        setStatus({
          type: "error",
          message: "Failed to read file",
        });
      }
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      // Prepare the payload based on message type and upload method
      let payload: any = {
        to: phoneNumber,
        type: messageType,
      };

      switch (messageType) {
        case "text":
          payload.message = message;
          break;

        case "image":
        case "document":
          if (uploadMethod === "url") {
            payload.options = {
              url: options.url,
            };
          } else {
            // For file uploads
            payload.options = {
              base64: options.base64,
              filename: options.filename,
            };
          }
          if (message) {
            payload.message = message; // Caption for images and documents
          }
          break;

        case "location":
          payload.options = {
            latitude: parseFloat(options.latitude),
            longitude: parseFloat(options.longitude),
            name: options.name,
            address: options.address,
          };
          break;

        case "buttons":
          payload.message = message;
          payload.options = {
            buttons: options.buttons.filter((btn) => btn.trim() !== ""),
          };
          break;
      }

      console.log("Sending payload:", {
        ...payload,
        options: payload.options?.base64
          ? { ...payload.options, base64: "[BASE64_DATA]" }
          : payload.options,
      });

      const response = await fetch("/api/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          message: "Message sent successfully!",
        });
        setMessage("");
        if (messageType !== "text") {
          setOptions({
            url: "",
            filename: "",
            latitude: "",
            longitude: "",
            name: "",
            address: "",
            buttons: [""],
            base64: "",
            mimeType: "",
          });
        }
      } else {
        throw new Error(data.error || data.details || "Failed to send message");
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to send message",
      });
    } finally {
      setLoading(false);
    }
  };

  const addButton = () => {
    setOptions((prev) => ({
      ...prev,
      buttons: [...prev.buttons, ""],
    }));
  };

  const updateButton = (index: number, value: string) => {
    const newButtons = [...options.buttons];
    newButtons[index] = value;
    setOptions((prev) => ({
      ...prev,
      buttons: newButtons,
    }));
  };

  return (
    <YStack padding="$4" space="$4" maxWidth={600} margin="auto">
      <Card bordered padded elevate backgroundColor="$background">
        <YStack space="$4">
          <Text
            fontSize="$8"
            fontWeight="bold"
            textAlign="center"
            color="$color"
          >
            WhatsApp Message Tester
          </Text>
          <Separator />

          <form onSubmit={handleSubmit}>
            <YStack space="$6">
              {/* Phone Number Input */}
              <Card bordered elevate>
                <YStack space="$2" padding="$3">
                  <Text fontSize="$5" fontWeight="bold" color="$color">
                    Recipient Details
                  </Text>
                  <Input
                    size="$4"
                    borderRadius="$4"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number (e.g., 2348012345678)"
                    disabled={loading}
                  />
                </YStack>
              </Card>

              {/* Message Type Selector */}
              <Card bordered elevate>
                <YStack space="$2" padding="$3">
                  <Text fontSize="$5" fontWeight="bold" color="$color">
                    Message Type
                  </Text>
                  <Select
                    id="message-type"
                    value={messageType}
                    onValueChange={(value) =>
                      setMessageType(value as MessageType)
                    }
                    disabled={loading}
                  >
                    <Select.Trigger width="100%" size="$4" borderRadius="$4">
                      <Select.Value placeholder="Select message type" />
                    </Select.Trigger>

                    <Select.Content>
                      <Select.ScrollUpButton />
                      <Select.Viewport>
                        <Select.Group>
                          <Select.Label>Message Types</Select.Label>
                          {[
                            { value: "text", label: "Text Message" },
                            { value: "image", label: "Image Message" },
                            { value: "document", label: "Document" },
                            { value: "audio", label: "Audio Message" },
                            { value: "location", label: "Location" },
                            { value: "buttons", label: "Button Message" },
                          ].map((type) => (
                            <Select.Item key={type.value} value={type.value}>
                              <Select.ItemText>{type.label}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Group>
                      </Select.Viewport>
                      <Select.ScrollDownButton />
                    </Select.Content>
                  </Select>
                </YStack>
              </Card>

              {/* Message Content */}
              <Card bordered elevate>
                <YStack space="$3" padding="$3">
                  <Text fontSize="$5" fontWeight="bold" color="$color">
                    Message Content
                  </Text>

                  {messageType === "text" && (
                    <Input
                      size="$4"
                      borderRadius="$4"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      multiline
                      numberOfLines={4}
                      disabled={loading}
                    />
                  )}

                  {(messageType === "image" ||
                    messageType === "document" ||
                    messageType === "audio") && (
                    <YStack space="$3">
                      <XStack space="$2" alignItems="center">
                        <Text>Upload Method:</Text>
                        <Label htmlFor="url-method">
                          <XStack space="$2" alignItems="center">
                            <Switch
                              id="url-method"
                              size="$4"
                              checked={uploadMethod === "url"}
                              onCheckedChange={(checked) => {
                                setUploadMethod(checked ? "url" : "file");
                                // Clear previous upload data when switching methods
                                setOptions((prev) => ({
                                  ...prev,
                                  url: "",
                                  base64: "",
                                  mimeType: "",
                                  filename: "",
                                }));
                              }}
                            >
                              <Switch.Thumb animation="quick" />
                            </Switch>
                            <Text color="$color">
                              {uploadMethod === "url" ? "URL" : "File Upload"}
                            </Text>
                          </XStack>
                        </Label>
                      </XStack>

                      {uploadMethod === "url" ? (
                        <Input
                          size="$4"
                          borderRadius="$4"
                          value={options.url}
                          onChange={(e) =>
                            setOptions((prev) => ({
                              ...prev,
                              url: e.target.value,
                            }))
                          }
                          placeholder={`Enter ${messageType} URL`}
                          disabled={loading}
                        />
                      ) : (
                        <YStack space="$2">
                          <input
                            type="file"
                            accept={
                              messageType === "image"
                                ? "image/*"
                                : messageType === "audio"
                                ? "audio/*"
                                : messageType === "document"
                                ? ".pdf,.doc,.docx,.txt"
                                : undefined
                            }
                            onChange={handleFileUpload}
                            disabled={loading}
                            style={{
                              padding: "8px",
                              border: "1px solid var(--color-border)",
                              borderRadius: "8px",
                              width: "100%",
                            }}
                          />
                          {options.filename && (
                            <Text fontSize="$3" color="$color">
                              Selected file: {options.filename}
                            </Text>
                          )}
                        </YStack>
                      )}

                      {messageType !== "audio" && (
                        <Input
                          size="$4"
                          borderRadius="$4"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Enter caption (optional)"
                          disabled={loading}
                        />
                      )}
                    </YStack>
                  )}

                  {messageType === "location" && (
                    <YStack space="$3">
                      <XStack space="$3">
                        <Input
                          flex={1}
                          size="$4"
                          borderRadius="$4"
                          value={options.latitude}
                          onChange={(e) =>
                            setOptions((prev) => ({
                              ...prev,
                              latitude: e.target.value,
                            }))
                          }
                          placeholder="Latitude"
                          disabled={loading}
                        />
                        <Input
                          flex={1}
                          size="$4"
                          borderRadius="$4"
                          value={options.longitude}
                          onChange={(e) =>
                            setOptions((prev) => ({
                              ...prev,
                              longitude: e.target.value,
                            }))
                          }
                          placeholder="Longitude"
                          disabled={loading}
                        />
                      </XStack>
                      <Input
                        size="$4"
                        borderRadius="$4"
                        value={options.name}
                        onChange={(e) =>
                          setOptions((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Location name (optional)"
                        disabled={loading}
                      />
                      <Input
                        size="$4"
                        borderRadius="$4"
                        value={options.address}
                        onChange={(e) =>
                          setOptions((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        placeholder="Address (optional)"
                        disabled={loading}
                      />
                    </YStack>
                  )}

                  {messageType === "buttons" && (
                    <YStack space="$3">
                      <Input
                        size="$4"
                        borderRadius="$4"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter message..."
                        disabled={loading}
                      />
                      <YStack space="$2">
                        {options.buttons.map((button, index) => (
                          <Input
                            key={index}
                            size="$4"
                            borderRadius="$4"
                            value={button}
                            onChange={(e) =>
                              updateButton(index, e.target.value)
                            }
                            placeholder={`Button ${index + 1}`}
                            disabled={loading}
                          />
                        ))}
                      </YStack>
                      <Button
                        size="$3"
                        theme="gray"
                        onPress={addButton}
                        disabled={loading || options.buttons.length >= 3}
                      >
                        Add Button
                      </Button>
                    </YStack>
                  )}
                </YStack>
              </Card>

              <Separator />

              {/* Submit Button */}
              <Button
                size="$5"
                theme="active"
                borderRadius="$4"
                onPress={handleSubmit}
                disabled={
                  loading ||
                  !phoneNumber ||
                  (!message && messageType === "text") ||
                  (messageType === "image" &&
                    !options.url &&
                    !options.base64) ||
                  (messageType === "document" &&
                    !options.url &&
                    !options.base64) ||
                  (messageType === "audio" && !options.url && !options.base64)
                }
              >
                {loading ? "Sending..." : "Send Message"}
              </Button>

              {/* Status Message */}
              {status.message && (
                <Card
                  bordered
                  padded
                  elevate
                  backgroundColor={
                    status.type === "success" ? "$green2" : "$red2"
                  }
                >
                  <Text
                    textAlign="center"
                    color={status.type === "success" ? "$green10" : "$red10"}
                  >
                    {status.message}
                  </Text>
                </Card>
              )}
            </YStack>
          </form>
        </YStack>
      </Card>
    </YStack>
  );
}
