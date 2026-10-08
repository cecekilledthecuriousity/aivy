"use server";

import { z } from "zod";
import prisma from "@/lib/db";
import { evaluationSchema, EvaluationInput } from "@/schemas/evaluation-schema";
import { calculateGap, getTdsGapLabel } from "@/lib/gap-calculator";
import { canEditSession } from "@/lib/rbac";
import { AppraisalStatus, IDPStatus } from "@prisma/client";

async function processEvaluation(
  input: EvaluationInput,
  userId: string,
  targetStatus?: AppraisalStatus
) {
  const parsed = evaluationSchema.parse(input);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const session = await prisma.appraisalSession.findUnique({
    where: { id: parsed.sessionId },
    include: {
      employee: {
        include: {
          competencies: true,
        },
      },
    },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  if (!canEditSession(user, session)) {
    throw new Error("Unauthorized to edit this session");
  }

  return await prisma.$transaction(async (tx) => {
    await tx.appraisalScoreItem.deleteMany({
      where: { sessionId: parsed.sessionId },
    });
    await tx.iDPItem.deleteMany({
      where: { sessionId: parsed.sessionId },
    });

    const scoreItemsToCreate = parsed.scores.map((score) => {
      const assignment = session.employee.competencies.find(
        (c) => c.competencyId === score.competencyId
      );

      if (!assignment) {
        throw new Error(`Competency ${score.competencyId} not assigned to employee`);
      }

      const standardLevel = assignment.standardLevel;
      const actualLevel = score.actualLevel;
      const gapValue = calculateGap(standardLevel, actualLevel);
      const gapLabel = getTdsGapLabel(gapValue);

      return {
        sessionId: parsed.sessionId,
        competencyId: score.competencyId,
        standardLevel,
        actualLevel,
        gapValue,
        gapLabel,
        managerComment: score.managerComment,
      };
    });

    if (scoreItemsToCreate.length > 0) {
      await tx.appraisalScoreItem.createMany({
        data: scoreItemsToCreate,
      });
    }

    if (parsed.idpItems && parsed.idpItems.length > 0) {
      const idpItemsToCreate = parsed.idpItems.map((idp) => ({
        sessionId: parsed.sessionId,
        competencyId: idp.competencyId,
        actionPlan: idp.actionPlan,
        targetDate: new Date(idp.targetDate),
        status: IDPStatus.PLANNED,
      }));

      await tx.iDPItem.createMany({
        data: idpItemsToCreate,
      });
    }

    const updateData: any = {};
    if (parsed.managerNotes !== undefined) {
      updateData.managerNotes = parsed.managerNotes;
    }
    
    if (targetStatus) {
      updateData.status = targetStatus;
      if (targetStatus === AppraisalStatus.SUBMITTED) {
        updateData.submittedAt = new Date();
      }
    }

    const updatedSession = await tx.appraisalSession.update({
      where: { id: parsed.sessionId },
      data: updateData,
    });

    return updatedSession;
  });
}

export async function saveEvaluationDraftAction(input: EvaluationInput, userId?: string) {
  if (!userId) throw new Error("Unauthorized");
  return await processEvaluation(input, userId);
}

export async function submitManagerEvaluationAction(input: EvaluationInput, userId?: string) {
  if (!userId) throw new Error("Unauthorized");
  return await processEvaluation(input, userId, AppraisalStatus.SUBMITTED);
}
