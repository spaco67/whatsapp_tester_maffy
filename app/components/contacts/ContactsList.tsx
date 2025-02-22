"use client";

import React, { useState, useMemo } from "react";
import { YStack, Input, Text, Separator, Button, XStack, Image } from "tamagui";
import { useWhatsAppStore } from "../../store/whatsapp-store";

export function ContactsList() {
  const contacts = useWhatsAppStore((state) => state.contacts);
  const selectedContact = useWhatsAppStore((state) => state.selectedContact);
  const setSelectedContact = useWhatsAppStore((state) => state.setSelectedContact);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        contact.name?.toLowerCase().includes(searchLower) ||
        contact.pushname?.toLowerCase().includes(searchLower) ||
        contact.id.includes(searchLower)
      );
    });
  }, [contacts, searchQuery]);

  return (
    <YStack space="$2" padding="$2">
      {/* Search Input */}
      <Input
        size="$4"
        borderRadius="$4"
        placeholder="Search contacts..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Contacts List */}
      <YStack space="$2" marginTop="$2">
        {filteredContacts.map((contact) => (
          <Button
            key={contact.id}
            theme={selectedContact?.id === contact.id ? "active" : "gray"}
            onPress={() => setSelectedContact(contact)}
            padding="$3"
            borderRadius="$4"
          >
            <XStack space="$3" alignItems="center" width="100%">
              {contact.image ? (
                <Image
                  source={{ uri: contact.image }}
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
                    {(contact.name?.[0] || contact.pushname?.[0] || "?").toUpperCase()}
                  </Text>
                </YStack>
              )}
              <YStack flex={1}>
                <Text
                  color="$color"
                  fontSize="$4"
                  fontWeight="bold"
                  numberOfLines={1}
                >
                  {contact.name || contact.pushname || "Unknown"}
                </Text>
                <Text color="$gray11" fontSize="$2" numberOfLines={1}>
                  {contact.id.replace("@s.whatsapp.net", "")}
                </Text>
              </YStack>
            </XStack>
          </Button>
        ))}

        {filteredContacts.length === 0 && (
          <YStack
            padding="$4"
            alignItems="center"
            justifyContent="center"
            opacity={0.5}
          >
            <Text color="$gray11">No contacts found</Text>
          </YStack>
        )}
      </YStack>
    </YStack>
  );
}
