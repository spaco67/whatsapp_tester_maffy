"use client";

import React, { useEffect } from "react";
import { XStack, YStack, Text, Card, Separator, ScrollView } from "tamagui";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ContactsList } from "./components/contacts/ContactsList";
import { ChatWindow } from "./components/chat/ChatWindow";
import { useWhatsAppStore } from "./store/whatsapp-store";
import { whapiClient } from "./lib/whapi-client";
import { websocketService } from "./lib/websocket-service";

export default function DashboardPage() {
  const setContacts = useWhatsAppStore((state) => state.setContacts);
  const setMessages = useWhatsAppStore((state) => state.setMessages);
  const setLoading = useWhatsAppStore((state) => state.setLoading);
  const setError = useWhatsAppStore((state) => state.setError);
  const stats = useWhatsAppStore((state) => state.stats);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        setError(null);

        // Load contacts from Whapi API
        const contacts = await whapiClient.getContacts();
        setContacts(contacts);

        // Load messages for each contact
        await Promise.all(
          contacts.map(async (contact) => {
            const messages = await whapiClient.getMessages(contact.id);
            setMessages(contact.id, messages);
          })
        );

      } catch (error) {
        console.error("Failed to load initial data:", error);
        setError("Failed to load data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();

    // Connect WebSocket
    websocketService;

    return () => {
      websocketService.disconnect();
    };
  }, [setContacts, setMessages, setLoading, setError]);

  return (
    <DashboardLayout>
      <YStack flex={1} backgroundColor="$background">
        {/* Dashboard Header */}
        <Card bordered elevate padding="$4" margin="$4">
          <YStack space="$4">
            <Text fontSize="$8" fontWeight="bold" color="$color">
              Dashboard Overview
            </Text>
            <Separator />
            <XStack space="$4" flexWrap="wrap">
              <StatCard
                title="Total Messages"
                value={stats.totalMessages}
                theme="blue"
              />
              <StatCard
                title="Active Chats"
                value={stats.activeChats}
                theme="green"
              />
              <StatCard
                title="Pending Responses"
                value={stats.pendingResponses}
                theme="yellow"
              />
            </XStack>
          </YStack>
        </Card>

        {/* Main Content */}
        <XStack flex={1} margin="$4" space="$4">
          {/* Contacts List */}
          <Card bordered elevate width={300}>
            <YStack padding="$2">
              <Text fontSize="$6" fontWeight="bold" padding="$2" color="$color">
                Contacts
              </Text>
              <Separator />
              <ScrollView height="100%">
                <ContactsList />
              </ScrollView>
            </YStack>
          </Card>

          {/* Chat Window */}
          <Card bordered elevate flex={1}>
            <ChatWindow />
          </Card>
        </XStack>
      </YStack>
    </DashboardLayout>
  );
}

function StatCard({ title, value, theme = "blue" }: { 
  title: string; 
  value: number; 
  theme?: "blue" | "green" | "yellow" 
}) {
  const colors = {
    blue: { bg: "$blue2", text: "$blue11" },
    green: { bg: "$green2", text: "$green11" },
    yellow: { bg: "$yellow2", text: "$yellow11" },
  };

  return (
    <Card
      bordered
      elevate
      padding="$4"
      backgroundColor={colors[theme].bg}
      minWidth={200}
    >
      <YStack space="$2">
        <Text fontSize="$3" color={colors[theme].text}>
          {title}
        </Text>
        <Text fontSize="$8" fontWeight="bold" color={colors[theme].text}>
          {value.toLocaleString()}
        </Text>
      </YStack>
    </Card>
  );
}
