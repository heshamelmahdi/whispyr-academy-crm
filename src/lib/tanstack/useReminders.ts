import { CreateReminderRequest } from "@/services/reminder/schema";
import { api } from "../api";
import { Reminder } from "@/generated/prisma/client";
import { useMutation } from "@tanstack/react-query";

export function useCreateLeadReminder(leadId: string) {
  // TODO: add query client invalidation
  return useMutation({
    mutationFn: async (request: CreateReminderRequest): Promise<Reminder> => {
      const { data } = await api.post(`/leads/${leadId}/reminders`, request);
      return data.data;
    },
  });
}
