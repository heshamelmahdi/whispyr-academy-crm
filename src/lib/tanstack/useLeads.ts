import { Lead } from "@/generated/prisma/client";
import { CreateLeadRequest, ListLeadsParams } from "@/services/lead/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useGetLeads(params: ListLeadsParams) {
  return useQuery({
    queryKey: ["leads", params],
    queryFn: async (): Promise<Lead[]> => {
      const { data } = await api.get("/leads", {
        params,
      });
      return data.data;
    },
  });
}

export function useCreateLead(lead: CreateLeadRequest) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<Lead> => {
      const { data } = await api.post("/leads", lead);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
