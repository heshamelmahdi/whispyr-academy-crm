import { dbCreateActivity, dbGetLeadActivities } from "./db";
import { buildActivityContent } from "./helpers";
import {
  CreateActivityRequest,
  createActivitySchema,
  GetLeadActivitiesRequest,
} from "./schema";

export async function createActivity(request: CreateActivityRequest) {
  const validated = createActivitySchema.safeParse(request);
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const content = buildActivityContent(
    validated.data.type,
    validated.data.meta,
  );

  const activity = await dbCreateActivity({
    lead: {
      connect: {
        id: validated.data.leadId,
      },
    },
    actor: {
      connect: {
        id: validated.data.actorId,
      },
    },
    type: validated.data.type,
    content: content,
  });

  return {
    success: true,
    activity,
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
