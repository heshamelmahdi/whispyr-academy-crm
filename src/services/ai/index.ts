import { generateLeadBriefSchema } from "./schema";
import { generateLeadBrief } from "./service";

export const AIService = {
  generateLeadBrief,
} as const;

export const AISchema = {
  generateLeadBrief: generateLeadBriefSchema,
} as const;
