import { prisma } from "@/lib/prisma";
import { ListLeadsParams } from "./schema";
import { Prisma } from "@/generated/prisma/client";

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
