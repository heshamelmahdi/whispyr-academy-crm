import { z } from "zod";

export const listLeadsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});

export type ListLeadsParams = z.infer<typeof listLeadsQuerySchema>;

export const createLeadSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(8).max(15),
  email: z.email(),
  note: z.string().optional(),
});

export type CreateLeadRequest = z.infer<typeof createLeadSchema>;
