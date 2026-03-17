import { Prisma, Profile, Role } from "@/generated/prisma/client";
import { CreateLeadRequest, ListLeadsParams } from "./schema";
import { dbCreateLead, dbListLeads } from "./db";

export async function listLeads(profile: Profile, params: ListLeadsParams) {
  // Build where clause
  const where: Prisma.LeadWhereInput = {};
  if (profile.role === Role.AGENT) {
    where.assignedToId = profile.id;
  }

  return dbListLeads(where, params);
}

export async function createLead(profile: Profile, data: CreateLeadRequest) {
  return dbCreateLead(profile, data);
}
