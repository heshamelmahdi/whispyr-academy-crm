import { prisma } from "@/lib/prisma";
import { CreateNotificationRequest } from "./schema";
import { Prisma } from "@/generated/prisma/client";

export const dbCreateNotification = async (
  request: CreateNotificationRequest,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx ?? prisma;
  const notification = await client.notification.create({
    data: {
      ...request,
    },
  });

  return notification;
};

export const dbGetLeadAssignedTo = async (leadId: string) => {
  return prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      assignedToId: true,
    },
  });
};
