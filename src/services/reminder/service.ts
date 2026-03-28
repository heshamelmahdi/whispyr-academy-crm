import { UserSnapshot } from "@/utils/types/user";
import { CreateReminderRequest } from "./schema";
import {
  dbCreateReminder,
  dbGetLeadAssignedTo,
  dbGetReminder,
  dbUpdateReminderQstashMessageId,
  dbUpdateReminderStatus,
} from "./db";
import { qstash, reminderCallbackUrl } from "@/lib/qstash";
import { prisma } from "@/lib/prisma";
import { validateLeadAccess } from "./helpers";
import { redis } from "@/lib/redis";
import { NotificationService } from "../notification";

export const createReminder = async (
  request: CreateReminderRequest,
  userSnapshot: UserSnapshot,
) => {
  // assignedTo is either from body or the requesting user
  const assignedToId = request.assignedToId ?? userSnapshot.id;

  // Validate assignedTo has access to the lead
  const leadAssignedTo = await dbGetLeadAssignedTo(request.leadId);
  if (!validateLeadAccess(leadAssignedTo?.assignedToId, userSnapshot)) {
    throw new Error(
      "You are not authorized to create a reminder for this lead",
    );
  }

  // In a transaction
  const reminder = await prisma.$transaction(async (tx) => {
    // Create reminder
    const reminder = await dbCreateReminder({ ...request, assignedToId }, tx);
    const notBefore = reminder.dueAt.getTime();
    console.log("notBefore", notBefore);

    // Schedule reminder
    const publishResult = await qstash.publishJSON({
      url: reminderCallbackUrl,
      body: { reminderId: reminder.id },
      notBefore: notBefore / 1000,
    });

    console.log("publishResult", publishResult);

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

export const fireReminder = async (reminderId: string) => {
  const idempotencyKey = `reminder:fired:${reminderId}`;
  const alreadyProcessed = await redis.get(idempotencyKey);

  if (alreadyProcessed)
    return {
      status: "duplicate" as const,
    };

  const reminder = await dbGetReminder(reminderId);
  if (!reminder) {
    await redis.set(idempotencyKey, "missing");
    await redis.expire(idempotencyKey, 60 * 60 * 24);
    return {
      status: "missing" as const,
    };
  }

  // Set idemopency key
  await redis.set(idempotencyKey, "processed");
  await redis.expire(idempotencyKey, 60 * 60 * 24);

  await prisma.$transaction(async (tx) => {
    // Update reminder status to DUE
    await dbUpdateReminderStatus(reminderId, "FIRED", tx);

    // Create notification
    await NotificationService.create(
      {
        title: reminder.title,
        body: `Reminder for lead ${reminder.lead.name}. Note: ${reminder.note}`,
        recipientId: reminder.assignedToId,
        leadId: reminder.leadId,
      },
      { id: reminder.assignedTo.id, role: reminder.assignedTo.role },
      tx,
    );
  });

  return {
    status: "success" as const,
  };
};
