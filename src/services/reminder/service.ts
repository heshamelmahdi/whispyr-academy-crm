import { UserSnapshot } from "@/utils/types/user";
import { CreateReminderRequest } from "./schema";
import {
  dbCreateReminder,
  dbGetLeadAssignedTo,
  dbUpdateReminderQstashMessageId,
} from "./db";
import { qstash, reminderCallbackUrl } from "@/lib/qstash";
import { prisma } from "@/lib/prisma";

export const createReminder = async (
  request: CreateReminderRequest,
  userSnapshot: UserSnapshot,
) => {
  // assignedTo is either from body or the requesting user
  const assignedToId = request.assignedToId ?? userSnapshot.id;

  // Validate assignedTo has access to the lead
  const leadAssignedTo = await dbGetLeadAssignedTo(request.leadId);
  if (leadAssignedTo?.assignedToId !== assignedToId) {
    throw new Error(
      "You are not authorized to create a reminder for this lead",
    );
  }

  // In a transaction
  const reminder = await prisma.$transaction(async (tx) => {
    // Create reminder
    const reminder = await dbCreateReminder({ ...request, assignedToId }, tx);

    // Schedule reminder
    const publishResult = await qstash.publishJSON({
      url: reminderCallbackUrl,
      body: { reminderId: reminder.id },
      notBefore: reminder.dueAt.getTime(),
    });

    // Update db reminder with qstash message id
    await dbUpdateReminderQstashMessageId(
      reminder.id,
      publishResult.messageId,
      tx,
    );

    return reminder;
  });

  return reminder;
};
