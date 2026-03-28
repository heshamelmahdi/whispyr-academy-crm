import { prisma } from "@/lib/prisma";
import { CreateReminderRequest } from "./schema";
import { Prisma } from "@/generated/prisma/client";

export const dbGetLeadAssignedTo = async (leadId: string) => {
  return prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      assignedToId: true,
    },
  });
};

export const dbCreateReminder = async (
  reminder: CreateReminderRequest & { assignedToId: string },
  tx?: Prisma.TransactionClient,
) => {
  const client = tx ?? prisma;
  return client.reminder.create({
    data: {
      title: reminder.title,
      note: reminder.note,
      dueAt: reminder.dueAt,
      leadId: reminder.leadId,
      assignedToId: reminder.assignedToId,
    },
  });
};

export const dbUpdateReminderQstashMessageId = async (
  reminderId: string,
  qstashMessageId: string,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx ?? prisma;
  return client.reminder.update({
    where: { id: reminderId },
    data: { qstashMessageId },
  });
};
