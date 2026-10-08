"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateEmployeeSummary, AISummaryResult } from "@/lib/ai-summary";
import { canAccessSession, canEditSession } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

export async function generateAISummaryAction(
  sessionId: string,
  forceRegenerate: boolean = false
): Promise<AISummaryResult> {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const appraisalSession = await prisma.appraisalSession.findUnique({
    where: { id: sessionId },
  });

  if (!appraisalSession) {
    throw new Error("Appraisal session not found");
  }

  const hasAccess = canAccessSession(
    { id: session.user.id, role: session.user.role as Role },
    appraisalSession
  );
  
  const canEdit = canEditSession(
    { id: session.user.id, role: session.user.role as Role },
    appraisalSession
  );

  // Allow generating only if the user has access.
  // Generally, if forceRegenerate is true, we might restrict it to editors or HR admin.
  if (!hasAccess) {
    throw new Error("Forbidden: You do not have permission to access this session");
  }
  
  if (forceRegenerate && !canEdit && session.user.role !== Role.HR_ADMIN) {
     throw new Error("Forbidden: You do not have permission to regenerate summary for this session");
  }

  return await generateEmployeeSummary(sessionId, forceRegenerate);
}
