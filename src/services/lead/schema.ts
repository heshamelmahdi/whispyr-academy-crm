import { z } from "zod";

export const listLeadsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});

export type ListLeadsParams = z.infer<typeof listLeadsQuerySchema>;
