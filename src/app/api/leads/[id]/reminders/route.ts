import { leadIdParamsSchema } from "@/services/lead/schema";
import { ReminderSchema, ReminderService } from "@/services/reminder";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

// POST /api/leads/:id/reminders
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await authenticateUser();
    const { id } = leadIdParamsSchema.parse(await params);
    const body = await request.json();
    const data = ReminderSchema.create.parse(body);

    const reminder = await ReminderService.create(
      { ...data, leadId: id },
      { id: profile.id, role: profile.role },
    );

    return NextResponse.json({ success: true, data: reminder });
  } catch (error) {
    return handleRouteError(error);
  }
}
