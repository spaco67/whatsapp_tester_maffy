import React from "react";
import { XStack, YStack, Text, Button, Card, Separator } from "tamagui";
import { useWhatsAppStore } from "../../store/whatsapp-store";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const stats = useWhatsAppStore((state) => state.stats);
  const error = useWhatsAppStore((state) => state.error);

  return (
    <XStack flex={1} minHeight="100vh">
      {/* Sidebar */}
      <YStack
        width={250}
        backgroundColor="$background"
        borderRightWidth={1}
        borderColor="$borderColor"
        padding="$4"
      >
        <YStack space="$4">
          {/* Logo/Title */}
          <YStack space="$2">
            <Text fontSize="$7" fontWeight="bold" color="$color">
              WhatsApp
            </Text>
            <Text fontSize="$3" color="$color" opacity={0.7}>
              Dashboard
            </Text>
          </YStack>

          <Separator />

          {/* Navigation */}
          <YStack space="$2">
            <Text fontSize="$4" fontWeight="bold" color="$color">
              Navigation
            </Text>
            <Button
              size="$4"
              theme="active"
              borderRadius="$4"
              marginVertical="$1"
              onPress={() => {}}
            >
              Dashboard
            </Button>
            <Button
              size="$4"
              theme="gray"
              borderRadius="$4"
              marginVertical="$1"
              onPress={() => window.location.href = '/test'}
            >
              Message Tester
            </Button>
          </YStack>

          <Separator />

          {/* Stats Summary */}
          <YStack space="$2">
            <Text fontSize="$4" fontWeight="bold" color="$color">
              Quick Stats
            </Text>
            <Card bordered padding="$3" backgroundColor="$blue2">
              <YStack>
                <Text fontSize="$2" color="$blue11">Messages Today</Text>
                <Text fontSize="$6" fontWeight="bold" color="$blue11">
                  {stats.totalMessages}
                </Text>
              </YStack>
            </Card>
            <Card bordered padding="$3" backgroundColor="$green2">
              <YStack>
                <Text fontSize="$2" color="$green11">Active Chats</Text>
                <Text fontSize="$6" fontWeight="bold" color="$green11">
                  {stats.activeChats}
                </Text>
              </YStack>
            </Card>
          </YStack>

          {/* Error Display */}
          {error && (
            <Card
              backgroundColor="$red2"
              padding="$3"
              borderRadius="$4"
            >
              <Text color="$red11" fontSize="$2">
                {error}
              </Text>
            </Card>
          )}
        </YStack>
      </YStack>

      {/* Main Content */}
      <YStack flex={1} backgroundColor="$backgroundStrong">
        {children}
      </YStack>
    </XStack>
  );
}
