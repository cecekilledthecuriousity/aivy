import { describe, it, expect, vi, beforeEach } from "vitest";
import { saveEvaluationDraftAction, submitManagerEvaluationAction } from "@/actions/evaluation";
import { evaluationSchema } from "@/schemas/evaluation-schema";
import { AppraisalStatus, Role } from "@prisma/client";

// Mocking dependencies
const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
  appraisalSession: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: mockPrisma,
}));

describe("Evaluation Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Schema Validation", () => {
    it("should reject actualLevel outside 1-4", () => {
      const input = {
        sessionId: "sess-1",
        scores: [
          {
            competencyId: "comp-1",
            actualLevel: 5,
          },
        ],
      };

      const result = evaluationSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message.toLowerCase()).toContain("too big");
      }
    });

    it("should accept actualLevel between 1 and 4", () => {
      const input = {
        sessionId: "sess-1",
        scores: [
          {
            competencyId: "comp-1",
            actualLevel: 3,
          },
        ],
      };

      const result = evaluationSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("Actions", () => {
    const mockUser = {
      id: "user-1",
      role: Role.MANAGER,
    };

    const mockSession = {
      id: "sess-1",
      evaluatorId: "user-1",
      status: AppraisalStatus.PENDING_EVALUATION,
      employee: {
        competencies: [
          {
            competencyId: "comp-1",
            standardLevel: 3,
          },
        ],
      },
    };

    it("saveEvaluationDraftAction should calculate GAP and save automatically", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.appraisalSession.findUnique.mockResolvedValue(mockSession);
      
      const mockTx = {
        appraisalScoreItem: { deleteMany: vi.fn(), createMany: vi.fn() },
        iDPItem: { deleteMany: vi.fn(), createMany: vi.fn() },
        appraisalSession: { update: vi.fn().mockResolvedValue({ id: "sess-1", status: AppraisalStatus.PENDING_EVALUATION }) },
      };
      
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      const input = {
        sessionId: "sess-1",
        scores: [
          {
            competencyId: "comp-1",
            actualLevel: 2, // Standard is 3, Gap is -1
          },
        ],
      };

      await saveEvaluationDraftAction(input, "user-1");

      expect(mockTx.appraisalScoreItem.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            competencyId: "comp-1",
            standardLevel: 3,
            actualLevel: 2,
            gapValue: -1,
            gapLabel: "Memerlukan peningkatan kompetensi.",
          }),
        ],
      });
    });

    it("submitManagerEvaluationAction should transition status to SUBMITTED", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.appraisalSession.findUnique.mockResolvedValue(mockSession);
      
      const mockTx = {
        appraisalScoreItem: { deleteMany: vi.fn(), createMany: vi.fn() },
        iDPItem: { deleteMany: vi.fn(), createMany: vi.fn() },
        appraisalSession: { update: vi.fn().mockResolvedValue({ id: "sess-1", status: AppraisalStatus.SUBMITTED }) },
      };
      
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      const input = {
        sessionId: "sess-1",
        scores: [
          {
            competencyId: "comp-1",
            actualLevel: 4, 
          },
        ],
      };

      await submitManagerEvaluationAction(input, "user-1");

      expect(mockTx.appraisalSession.update).toHaveBeenCalledWith({
        where: { id: "sess-1" },
        data: expect.objectContaining({
          status: AppraisalStatus.SUBMITTED,
          submittedAt: expect.any(Date),
        }),
      });
    });
  });
});
