"use client";

import React, { useState } from "react";
import {
  YStack,
  XStack,
  Input,
  Button,
  Text,
  Card,
  TextArea,
  Select,
} from "tamagui";

export function GroupManager() {
  const [groupName, setGroupName] = useState("");
  const [participants, setParticipants] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const [action, setAction] = useState<"create" | "add_participants" | "remove_participants">("create");
  const [groupId, setGroupId] = useState("");

  const handleSubmit = async () => {
    if (action === "create" && !groupName) {
      setStatus({
        type: "error",
        message: "Group name is required",
      });
      return;
    }

    if (!participants) {
      setStatus({
        type: "error",
        message: "Participants are required",
      });
      return;
    }

    if ((action === "add_participants" || action === "remove_participants") && !groupId) {
      setStatus({
        type: "error",
        message: "Group ID is required",
      });
      return;
    }

    const participantsList = participants
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p);

    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          name: groupName,
          participants: participantsList,
          groupId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to manage group");
      }

      setStatus({
        type: "success",
        message: `Group ${action === "create" ? "created" : "updated"} successfully!`,
      });

      // Clear form if successful
      if (action === "create") {
        setGroupName("");
      }
      setParticipants("");
      setGroupId("");
    } catch (error) {
      console.error("Error managing group:", error);
      setStatus({
        type: "error",
        message: error.message || "Failed to manage group",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card bordered padded elevate backgroundColor="$background">
      <YStack space="$4">
        <Text fontSize="$8" fontWeight="bold" textAlign="center" color="$color">
          WhatsApp Group Manager
        </Text>

        <Select
          id="action"
          value={action}
          onValueChange={(value) => setAction(value as typeof action)}
        >
          <Select.Trigger width="100%" size="$4">
            <Select.Value placeholder="Select action" />
          </Select.Trigger>

          <Select.Content>
            <Select.ScrollUpButton />
            <Select.Viewport>
              <Select.Group>
                <Select.Label>Actions</Select.Label>
                <Select.Item value="create">
                  <Select.ItemText>Create New Group</Select.ItemText>
                </Select.Item>
                <Select.Item value="add_participants">
                  <Select.ItemText>Add Participants</Select.ItemText>
                </Select.Item>
                <Select.Item value="remove_participants">
                  <Select.ItemText>Remove Participants</Select.ItemText>
                </Select.Item>
              </Select.Group>
            </Select.Viewport>
            <Select.ScrollDownButton />
          </Select.Content>
        </Select>

        {action === "create" && (
          <Input
            size="$4"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        )}

        {(action === "add_participants" || action === "remove_participants") && (
          <Input
            size="$4"
            placeholder="Group ID"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
          />
        )}

        <YStack space="$2">
          <Text fontSize="$3" color="$color">
            Participants (one per line)
          </Text>
          <TextArea
            size="$4"
            placeholder="Enter phone numbers (one per line)"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            minHeight={100}
          />
        </YStack>

        <Button
          size="$4"
          theme="active"
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit"}
        </Button>

        {status.message && (
          <Card
            backgroundColor={status.type === "success" ? "$green2" : "$red2"}
            padding="$3"
          >
            <Text
              color={status.type === "success" ? "$green11" : "$red11"}
              textAlign="center"
            >
              {status.message}
            </Text>
          </Card>
        )}
      </YStack>
    </Card>
  );
} 