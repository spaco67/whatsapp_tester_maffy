import { NextResponse } from "next/server";
import { whapiClient } from "@/app/lib/whapi-client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, name, participants, groupId } = body;

    // Log the incoming request for debugging
    console.log('Group API Request:', {
      action,
      name,
      participantsCount: participants?.length,
      groupId
    });

    // Validate required fields
    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    // Validate participants format
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json(
        { error: "At least one participant is required" },
        { status: 400 }
      );
    }

    // Validate phone numbers and format them
    const formattedParticipants = participants.map(p => {
      const cleaned = p.replace(/\D/g, '');
      if (!/^\d{10,15}$/.test(cleaned)) {
        throw new Error(`Invalid phone number format: ${p}`);
      }
      // Ensure number starts with country code
      if (!cleaned.startsWith('234') && cleaned.startsWith('0')) {
        return '234' + cleaned.substring(1);
      }
      if (!cleaned.startsWith('234')) {
        return '234' + cleaned;
      }
      return cleaned;
    });

    switch (action) {
      case "create":
        if (!name?.trim()) {
          return NextResponse.json(
            { error: "Group name is required" },
            { status: 400 }
          );
        }
        console.log('Creating group:', { name: name.trim(), participants: formattedParticipants });
        const createResult = await whapiClient.createGroup(name.trim(), formattedParticipants);
        return NextResponse.json({ 
          success: true, 
          data: createResult,
          message: "Group created successfully" 
        });

      case "add_participants":
        if (!groupId?.trim()) {
          return NextResponse.json(
            { error: "Group ID is required" },
            { status: 400 }
          );
        }
        console.log('Adding participants:', { groupId: groupId.trim(), participants: formattedParticipants });
        const addResult = await whapiClient.addParticipantsToGroup(groupId.trim(), formattedParticipants);
        return NextResponse.json({ 
          success: true, 
          data: addResult,
          message: "Participants added successfully" 
        });

      case "remove_participants":
        if (!groupId?.trim()) {
          return NextResponse.json(
            { error: "Group ID is required" },
            { status: 400 }
          );
        }
        console.log('Removing participants:', { groupId: groupId.trim(), participants: formattedParticipants });
        const removeResult = await whapiClient.removeParticipantsFromGroup(groupId.trim(), formattedParticipants);
        return NextResponse.json({ 
          success: true, 
          data: removeResult,
          message: "Participants removed successfully" 
        });

      default:
        return NextResponse.json(
          { error: "Invalid action. Must be 'create', 'add_participants', or 'remove_participants'" },
          { status: 400 }
        );
    }
  } catch (error) {
    // Log the complete error for debugging
    console.error("Error managing group:", {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    // Return a user-friendly error message
    const errorMessage = error instanceof Error 
      ? error.message
      : "Failed to manage group. Please try again.";

    return NextResponse.json(
      { 
        error: errorMessage,
        success: false
      },
      { status: 500 }
    );
  }
} 