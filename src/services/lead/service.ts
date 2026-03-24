import { Prisma, Profile, Role } from "@/generated/prisma/client";
import { CreateLeadRequest, EditLeadRequest, ListLeadsParams } from "./schema";
import {
  dbCreateLead,
  dbFindAssignableAgentById,
  dbGetLeadById,
  dbListLeads,
  dbUpdateLead,
} from "./db";
import { buildLeadChangeActivities } from "./helpers";
import { canEditLeadContactFields } from "./permissions";

export class LeadServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "LeadServiceError";
  }
}

export async function listLeads(profile: Profile, params: ListLeadsParams) {
  // Build where clause
  const where: Prisma.LeadWhereInput = {};

  // Role-scoping contract:
  // - AGENT can only read assigned leads.
  // - MANAGER/ADMIN can read all leads.
  // UI-level bulk actions (checkboxes/reassign toolbar) should respect this scope.
  if (profile.role === Role.AGENT) {
    where.assignedToId = profile.id;
  }

  return dbListLeads(where, params);
}

export async function createLead(profile: Profile, data: CreateLeadRequest) {
  return dbCreateLead(profile, data);
}

export async function getLead(profile: Profile, id: string) {
  const lead = await dbGetLeadById(id);

  if (!lead) {
    throw new LeadServiceError("Lead not found", 404);
  }

  if (profile.role === Role.AGENT && lead.assignedToId !== profile.id) {
    throw new LeadServiceError("Unauthorized", 403);
  }

  return lead;
}

export async function updateLead(
  profile: Profile,
  id: string,
  data: EditLeadRequest,
) {
  const existingLead = await dbGetLeadById(id);

  if (!existingLead) {
    throw new LeadServiceError("Lead not found", 404);
  }

  if (profile.role === Role.AGENT && existingLead.assignedToId !== profile.id) {
    throw new LeadServiceError("Unauthorized", 403);
  }

  if (profile.role === Role.AGENT && data.assignedToId !== undefined) {
    throw new LeadServiceError("Unauthorized", 403);
  }

  if (!canEditLeadContactFields(profile.role, data)) {
    throw new LeadServiceError("Unauthorized", 403);
  }

  let nextAssignedToName: string | null | undefined = undefined;

  if (data.assignedToId !== undefined) {
    const nextAssignedAgent = await dbFindAssignableAgentById(data.assignedToId);

    if (!nextAssignedAgent) {
      throw new LeadServiceError("Assigned agent not found", 400);
    }

    nextAssignedToName = nextAssignedAgent.name;
  }

  const activities = buildLeadChangeActivities({
    leadId: id,
    actorId: profile.id,
    existing: {
      status: existingLead.status,
      stage: existingLead.stage,
      assignedToId: existingLead.assignedToId,
    },
    updates: data,
    existingAssignedToName: existingLead.assignedTo?.name ?? null,
    nextAssignedToName,
  });

  return dbUpdateLead(id, data, activities);
}
