"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppraisalStatus, Role } from "@prisma/client";

export async function requestRevisionAction(sessionId: string, hrNotes: string) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== Role.HR_ADMIN) {
    throw new Error("Unauthorized");
  }

  const appraisalSession = await prisma.appraisalSession.findUnique({
    where: { id: sessionId },
  });

  if (!appraisalSession) {
    throw new Error("Session not found");
  }

  if (appraisalSession.status !== AppraisalStatus.SUBMITTED) {
    throw new Error("Invalid state transition");
  }

  await prisma.appraisalSession.update({
    where: { id: sessionId },
    data: {
      status: AppraisalStatus.NEEDS_REVISION,
      hrNotes,
    },
  });
}

export async function approveEvaluationAction(sessionId: string, hrNotes?: string) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== Role.HR_ADMIN) {
    throw new Error("Unauthorized");
  }

  const appraisalSession = await prisma.appraisalSession.findUnique({
    where: { id: sessionId },
  });

  if (!appraisalSession) {
    throw new Error("Session not found");
  }

  if (appraisalSession.status !== AppraisalStatus.SUBMITTED) {
    throw new Error("Invalid state transition");
  }

  await prisma.appraisalSession.update({
    where: { id: sessionId },
    data: {
      status: AppraisalStatus.APPROVED,
      hrNotes,
      approvedAt: new Date(),
    },
  });
}

export async function publishEvaluationAction(sessionId: string) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== Role.HR_ADMIN) {
    throw new Error("Unauthorized");
  }

  const appraisalSession = await prisma.appraisalSession.findUnique({
    where: { id: sessionId },
  });

  if (!appraisalSession) {
    throw new Error("Session not found");
  }

  if (appraisalSession.status !== AppraisalStatus.APPROVED) {
    throw new Error("Invalid state transition");
  }

  await prisma.appraisalSession.update({
    where: { id: sessionId },
    data: {
      status: AppraisalStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });
}
