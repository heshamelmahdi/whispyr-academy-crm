import { Prisma, Profile, Role } from "@/generated/prisma/client";
import { ListLeadsParams } from "./schema";
import { dbListLeads } from "./db";

export async function listLeads(profile: Profile, params: ListLeadsParams) {
  // Build where clause
  const where: Prisma.LeadWhereInput = {};
  if (profile.role === Role.AGENT) {
    where.assignedToId = profile.id;
  }

  return dbListLeads(where, params);
}
