import { z } from "zod";

export const evaluationSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  managerNotes: z.string().optional(),
  scores: z.array(
    z.object({
      competencyId: z.string().min(1, "Competency ID is required"),
      actualLevel: z.number().int().min(1).max(4),
      managerComment: z.string().optional(),
    })
  ),
  idpItems: z.array(
    z.object({
      competencyId: z.string().min(1, "Competency ID is required"),
      actionPlan: z.string().min(1, "Action plan is required"),
      targetDate: z.union([z.date(), z.string()]),
      mentorOrCourse: z.string().optional(),
    })
  ).optional(),
});

export type EvaluationInput = z.infer<typeof evaluationSchema>;
