import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

// type CreateActivityData = {
//   leadId: string;
//   actorId: string;
//   type: ActivityType;
//   content: string;
// };

// type CreateActivityData = Prisma.ActivityCreateInput;

// type CreateActivityData = Omit<CreateActivityRequest, "meta"> & {
//   content: string;
// };

export async function dbCreateActivities(
  activities: Prisma.ActivityCreateManyInput[],
  tx?: Prisma.TransactionClient,
) {
  const client = tx ?? prisma;
  const created = await client.activity.createMany({
    data: activities,
  });

  return created;
}

export async function dbGetLeadActivities(
  where: Prisma.ActivityWhereInput,
  params: {
    page: number;
    pageSize: number;
  },
) {
  return await prisma.activity.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    take: params.pageSize,
    skip: (params.page - 1) * params.pageSize,
  });
}
