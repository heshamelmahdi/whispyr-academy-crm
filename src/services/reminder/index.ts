import { createReminderSchema } from "./schema";
import { createReminder } from "./service";

export const ReminderService = {
  create: createReminder,
} as const;

export const ReminderSchema = {
  create: createReminderSchema,
} as const;
