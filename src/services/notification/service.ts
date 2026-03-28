import { UserSnapshot } from "@/utils/types/user";
import { CreateNotificationRequest } from "./schema";
import { dbCreateNotification, dbGetLeadAssignedTo } from "./db";
import { validateLeadAccess } from "./helpers";
import { Prisma } from "@/generated/prisma/client";

export const createNotification = async (
  request: CreateNotificationRequest,
  userSnapshot: UserSnapshot,
  tx?: Prisma.TransactionClient,
) => {
  if (request.leadId) {
    const lead = await dbGetLeadAssignedTo(request.leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    if (!validateLeadAccess(lead.assignedToId, userSnapshot)) {
      throw new Error(
        "You are not authorized to create a notification for this lead",
      );
    }
  }

  const notification = await dbCreateNotification(request, tx);

  return notification;
};
