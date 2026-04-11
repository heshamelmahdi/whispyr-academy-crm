import { Role } from "@/generated/prisma/client";
import { UserSnapshot } from "@/utils/types/user";
import {
  dbGetOverdueRemindersCount,
  dbGetTopAgents,
  dbGetTotalLeads,
  dbGetTotalLeadsByStage,
  dbGetTotalLeadsByStatus,
} from "./db";

export async function getDashboardData(user: UserSnapshot) {
  const where = {
    ...(user.role === Role.AGENT && { assignedToId: user.id }),
  };

  const [
    totalLeads,
    totalLeadsByStage,
    totalLeadsByStatus,
    overdueRemindersCount,
  ] = await Promise.all([
    dbGetTotalLeads(where),
    dbGetTotalLeadsByStage(where),
    dbGetTotalLeadsByStatus(where),
    dbGetOverdueRemindersCount(where),
  ]);

  let topAgents: Awaited<ReturnType<typeof dbGetTopAgents>> = [];

  if (user.role !== Role.AGENT) {
    topAgents = await dbGetTopAgents();
  }

  return {
    totalLeads,
    totalLeadsByStage,
    totalLeadsByStatus,
    overdueRemindersCount,
    ...(user.role !== Role.AGENT && { topAgents }),
  };
}
