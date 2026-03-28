import { z } from "zod";

export const createNotificationSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  recipientId: z.uuid(),
  leadId: z.uuid().optional(),
});

export type CreateNotificationRequest = z.infer<
  typeof createNotificationSchema
>;
