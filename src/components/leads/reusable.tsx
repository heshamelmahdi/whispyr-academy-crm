import type React from "react";

import { LeadStage, LeadStatus } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";

const statusVariantMap: Record<
  LeadStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  OPEN: "info",
  WON: "success",
  LOST: "warning",
};

const stageVariantMap: Record<
  LeadStage,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  NEW: "outline",
  CONTACTED: "purple",
  QUALIFIED: "info",
  NEGOTIATING: "warning",
};

export function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatLeadDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant={statusVariantMap[status]}>{formatEnumLabel(status)}</Badge>
  );
}

export function StageBadge({ stage }: { stage: LeadStage }) {
  return <Badge variant={stageVariantMap[stage]}>{formatEnumLabel(stage)}</Badge>;
}
