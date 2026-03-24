import { Prisma } from "@/generated/prisma/client";
import { dbCreateActivities, dbGetLeadActivities } from "./db";
import { buildActivityContent } from "./helpers";
import {
  CreateActivityRequest,
  createManyActivitiesSchema,
  GetLeadActivitiesRequest,
} from "./schema";

export async function createActivities(
  request: CreateActivityRequest[],
  tx?: Prisma.TransactionClient,
) {
  const validated = createManyActivitiesSchema.safeParse(request);
  if (!validated.success) {
    return {
      success: false as const,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const activitiesToCreate: Prisma.ActivityCreateManyInput[] = [];
  for (const activity of validated.data) {
    const content = buildActivityContent(activity.type, activity.meta);
    activitiesToCreate.push({
      leadId: activity.leadId,
      actorId: activity.actorId,
      content,
      type: activity.type,
    });
  }

  const countCreated = await dbCreateActivities(activitiesToCreate, tx);

  return {
    success: true as const,
    count: countCreated.count,
  };
}

export async function getLeadActivities(request: GetLeadActivitiesRequest) {
  return await dbGetLeadActivities(
    {
      leadId: request.leadId,
    },
    {
      page: request.page,
      pageSize: request.pageSize,
    },
  );
}
