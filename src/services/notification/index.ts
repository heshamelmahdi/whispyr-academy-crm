import { createNotification } from "./service";

export const NotificationService = {
  create: createNotification,
} as const;
