import { prisma } from "@/lib/prisma";

export async function dbGetLeadWithContext(leadId: string) {
  return await prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      stage: true,
      status: true,
      assignedTo: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
    },
  });
}

export async function dbGetRecentActivities(leadId: string, limit = 20) {
  return await prisma.activity.findMany({
    where: { leadId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      type: true,
      content: true,
      createdAt: true,
      actor: {
        select: { name: true },
      },
    },
  });
}

export async function dbGetNextReminder(leadId: string) {
  return await prisma.reminder.findFirst({
    where: {
      leadId,
      status: "PENDING",
      dueAt: {
        gte: new Date(),
      },
    },
    orderBy: { dueAt: "asc" },
    select: {
      id: true,
      title: true,
      note: true,
      dueAt: true,
    },
  });
}
