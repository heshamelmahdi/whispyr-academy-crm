import { createActivity, getLeadActivities } from "./service";
import { getLeadActivitiesSchema } from "./schema";

export const ActivityService = {
  create: createActivity,
  getByLeadId: getLeadActivities,
} as const;

export const ActivitySchema = {
  getByLeadId: getLeadActivitiesSchema,
} as const;

export type { CreateActivityRequest } from "./schema";
