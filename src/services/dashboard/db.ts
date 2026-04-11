import {
  LeadStatus,
  Prisma,
  ReminderStatus,
  Role,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function dbGetTotalLeads(where: Prisma.LeadWhereInput) {
  return await prisma.lead.count({ where });
}

export async function dbGetTotalLeadsByStage(where: Prisma.LeadWhereInput) {
  const result = await prisma.lead.groupBy({
    where,
    by: ["stage"],
    _count: {
      _all: true,
    },
  });

  return result.map((item) => ({
    stage: item.stage,
    count: item._count._all,
  }));
}

export async function dbGetTotalLeadsByStatus(where: Prisma.LeadWhereInput) {
  const result = await prisma.lead.groupBy({
    where,
    by: ["status"],
    _count: {
      _all: true,
    },
  });

  return result.map((item) => ({
    status: item.status,
    count: item._count._all,
  }));
}

export async function dbGetOverdueRemindersCount(
  where: Prisma.ReminderWhereInput,
) {
  return await prisma.reminder.count({
    where: {
      ...where,
      dueAt: { lt: new Date() },
      status: { in: [ReminderStatus.PENDING, ReminderStatus.FIRED] },
    },
  });
}

export async function dbGetTopAgents(limit = 5) {
  const agents = await prisma.profile.findMany({
    where: {
      role: Role.AGENT,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: {
          leads: true,
        },
      },
      leads: {
        where: {
          status: LeadStatus.WON,
        },
        select: {
          id: true,
        },
      },
    },
  });

  return agents
    .map((agent) => {
      return {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        leadsCount: agent._count.leads,
        wonCount: agent.leads.length,
      };
    })
    .sort((a, b) => b.wonCount - a.wonCount)
    .slice(0, limit);
}
