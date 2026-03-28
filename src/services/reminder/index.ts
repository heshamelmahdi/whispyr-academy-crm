import { createReminderSchema, qstashReminderDueSchema } from "./schema";
import { createReminder, fireReminder } from "./service";

export const ReminderService = {
  create: createReminder,
  fire: fireReminder,
} as const;

export const ReminderSchema = {
  create: createReminderSchema,
  qstash: qstashReminderDueSchema,
} as const;
