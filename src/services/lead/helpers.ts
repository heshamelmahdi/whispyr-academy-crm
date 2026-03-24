import {
  ActivityType,
  LeadStage,
  LeadStatus,
  Prisma,
} from "@/generated/prisma/client";

interface BuildLeadChangeActivitiesParams {
  leadId: string;
  actorId: string;
  existing: {
    status: LeadStatus;
    stage: LeadStage;
    assignedToId: string | null;
  };
  updates: {
    status?: LeadStatus;
    stage?: LeadStage;
    assignedToId?: string | null;
  };
  existingAssignedToName?: string | null;
  nextAssignedToName?: string | null;
}

export function buildPagination(total: number, page: number, pageSize: number) {
  return {
    page,
    pageSize,
    total,
    pages: Math.ceil(total / pageSize),
  };
}

export function buildLeadChangeActivities({
  leadId,
  actorId,
  existing,
  updates,
  existingAssignedToName,
  nextAssignedToName,
}: BuildLeadChangeActivitiesParams): Prisma.ActivityCreateManyInput[] {
  const activities: Omit<Prisma.ActivityCreateManyInput, "leadId">[] = [];

  if (updates.status && updates.status !== existing.status) {
    activities.push({
      actorId,
      type: ActivityType.STATUS_CHANGE,
      content: `Status changed from ${existing.status} to ${updates.status}`,
    });
  }

  if (updates.stage && updates.stage !== existing.stage) {
    activities.push({
      actorId,
      type: ActivityType.STAGE_CHANGE,
      content: `Stage changed from ${existing.stage} to ${updates.stage}`,
    });
  }

  if (
    updates.assignedToId !== undefined &&
    updates.assignedToId !== existing.assignedToId
  ) {
    activities.push({
      actorId,
      type: ActivityType.ASSIGNMENT_CHANGE,
      content: `Assignment changed from ${
        existingAssignedToName || "Unassigned"
      } to ${nextAssignedToName || "Unassigned"}`,
    });
  }

  return activities.map((activity) => ({
    leadId,
    ...activity,
  }));
}
