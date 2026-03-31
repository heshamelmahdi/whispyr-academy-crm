import { UserSnapshot } from "@/utils/types/user";
import {
  dbGetLeadWithContext,
  dbGetNextReminder,
  dbGetRecentActivities,
} from "./db";
import { buildLeadBriefPrompt, validateLeadAccess } from "./helpers";
import { generateText, Output } from "ai";
import { leadBriefSchema } from "./schema";

export async function generateLeadBrief(
  leadId: string,
  userSnapshot: UserSnapshot,
) {
  const lead = await dbGetLeadWithContext(leadId);
  if (!lead) {
    throw new Error("Lead not found");
  }

  if (!validateLeadAccess(lead.assignedTo?.id, userSnapshot)) {
    throw new Error("You are not authorized to access this lead");
  }

  const [activities, nextReminder] = await Promise.all([
    dbGetRecentActivities(leadId),
    dbGetNextReminder(leadId),
  ]);

  const prompt = buildLeadBriefPrompt({
    leadContext: lead,
    recentActivities: activities,
    nextReminder: nextReminder,
  });

  const { output } = await generateText({
    model: "deepseek/deepseek-v3.2-thinking",
    output: Output.object({ schema: leadBriefSchema }),
    prompt,
  });

  return output;
}
