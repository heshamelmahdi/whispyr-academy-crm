import { prisma } from "@/lib/prisma";
import { CreateLeadRequest, ListLeadsParams } from "./schema";
import { ActivityType, Prisma, Profile } from "@/generated/prisma/client";

export async function dbListLeads(
  where: Prisma.LeadWhereInput,
  params: ListLeadsParams,
) {
  const leads = await prisma.lead.findMany({
    where,
    take: params.pageSize,
    skip: (params.page - 1) * params.pageSize,
    orderBy: {
      createdAt: "desc",
    },
  });

  return leads;
}

export async function dbCreateLead(profile: Profile, data: CreateLeadRequest) {
  return await prisma.$transaction(async (tx) => {
    const lead = await tx.lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
      },
    });

    await tx.activity.create({
      data: {
        leadId: lead.id,
        actorId: profile.id,
        content: data.note,
        type: ActivityType.LEAD_CREATED,
      },
    });

    return lead;
  });
}
