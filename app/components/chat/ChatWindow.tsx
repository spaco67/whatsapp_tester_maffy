"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  YStack,
  XStack,
  Text,
  Input,
  Button,
  ScrollView,
  Card,
  Image,
} from "tamagui";
import { useWhatsAppStore } from "../../store/whatsapp-store";

export function ChatWindow() {
  const selectedContact = useWhatsAppStore((state) => state.selectedContact);
  const messages = useWhatsAppStore((state) =>
    selectedContact ? state.messagesByContact[selectedContact.id] || [] : []
  );
  const [newMessage, setNewMessage] = useState("");
  const scrollViewRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!selectedContact || !newMessage.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: selectedContact.id,
          message: newMessage,
          type: "text",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      // You might want to show an error toast here
    } finally {
      setLoading(false);
    }
  };

  if (!selectedContact) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        opacity={0.5}
      >
        <Text color="$gray11" fontSize="$5">
          Select a contact to start chatting
        </Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1}>
      {/* Chat Header */}
      <Card
        bordered
        padding="$4"
        backgroundColor="$backgroundStrong"
        borderRadius={0}
      >
        <XStack space="$3" alignItems="center">
          {selectedContact.image ? (
            <Image
              source={{ uri: selectedContact.image }}
              width={40}
              height={40}
              borderRadius="$4"
            />
          ) : (
            <YStack
              width={40}
              height={40}
              backgroundColor="$gray5"
              borderRadius="$4"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="$gray11" fontSize="$5">
                {(selectedContact.name?.[0] || selectedContact.pushname?.[0] || "?").toUpperCase()}
              </Text>
            </YStack>
          )}
          <YStack>
            <Text fontSize="$5" fontWeight="bold" color="$color">
              {selectedContact.name || selectedContact.pushname || "Unknown"}
            </Text>
            <Text fontSize="$2" color="$gray11">
              {selectedContact.id.replace("@s.whatsapp.net", "")}
            </Text>
          </YStack>
        </XStack>
      </Card>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        flex={1}
        padding="$4"
        space="$2"
        backgroundColor="$background"
      >
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOutgoing={message.from === "me"}
          />
        ))}
      </ScrollView>

      {/* Message Input */}
      <Card
        bordered
        padding="$4"
        backgroundColor="$backgroundStrong"
        borderRadius={0}
      >
        <XStack space="$2">
          <Input
            flex={1}
            size="$4"
            borderRadius="$4"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            size="$4"
            theme="active"
            borderRadius="$4"
            onPress={handleSendMessage}
            disabled={loading || !newMessage.trim()}
          >
            {loading ? "Sending..." : "Send"}
          </Button>
        </XStack>
      </Card>
    </YStack>
  );
}

function MessageBubble({ message, isOutgoing }: { 
  message: any; 
  isOutgoing: boolean;
}) {
  return (
    <XStack justifyContent={isOutgoing ? "flex-end" : "flex-start"}>
      <Card
        backgroundColor={isOutgoing ? "$blue2" : "$gray2"}
        padding="$3"
        borderRadius="$4"
        maxWidth="70%"
      >
        {message.type === "text" ? (
          <Text color={isOutgoing ? "$blue11" : "$gray12"}>
            {message.content.text}
          </Text>
        ) : message.type === "image" ? (
          <YStack space="$2">
            <Image
              source={{ uri: message.content.url }}
              width={200}
              height={200}
              borderRadius="$2"
            />
            {message.content.caption && (
              <Text color={isOutgoing ? "$blue11" : "$gray12"}>
                {message.content.caption}
              </Text>
            )}
          </YStack>
        ) : (
          <Text color={isOutgoing ? "$blue11" : "$gray12"}>
            {message.type} message
          </Text>
        )}
        <Text
          fontSize="$1"
          color={isOutgoing ? "$blue8" : "$gray8"}
          marginTop="$1"
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </Text>
      </Card>
    </XStack>
  );
}
