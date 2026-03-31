import { LeadBrief } from "@/services/ai/schema";
import { api } from "../api";
import { useMutation } from "@tanstack/react-query";

export function useGenerateLeadBrief(leadId: string) {
  return useMutation({
    mutationFn: async (): Promise<LeadBrief> => {
      const { data } = await api.post("/ai/lead-brief", { leadId });
      return data.data;
    },
  });
}
