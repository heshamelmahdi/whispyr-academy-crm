import { z } from "zod";

export const createReminderSchema = z.object({
  title: z.string().min(1),
  note: z.string().optional(),
  dueAt: z.coerce.date().refine((date) => {
    return (
      date.getTime() > new Date().getTime() &&
      date.getTime() < new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).getTime()
    );
  }),
  assignedToId: z.uuid().optional(),
});

export type CreateReminderRequest = z.infer<typeof createReminderSchema> & {
  leadId: string;
};
