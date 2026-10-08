import { describe, it, expect, vi, beforeEach } from "vitest";
import { saveEvaluationDraftAction, submitManagerEvaluationAction } from "@/actions/evaluation";
import { evaluationSchema } from "@/schemas/evaluation-schema";
import { AppraisalStatus, Role } from "@prisma/client";
import { getServerSession } from "next-auth";

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

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
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
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-1" } } as any);
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

      await saveEvaluationDraftAction(input);

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
      // IDP items deleteMany should not be called since idpItems is not provided
      expect(mockTx.iDPItem.deleteMany).not.toHaveBeenCalled();
    });

    it("submitManagerEvaluationAction should transition status to SUBMITTED", async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-1" } } as any);
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

      await submitManagerEvaluationAction(input);

      expect(mockTx.appraisalSession.update).toHaveBeenCalledWith({
        where: { id: "sess-1" },
        data: expect.objectContaining({
          status: AppraisalStatus.SUBMITTED,
          submittedAt: expect.any(Date),
        }),
      });
    });

    it("should reject when user is not authorized", async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-2" } } as any);
      const otherUser = { id: "user-2", role: Role.EMPLOYEE };
      mockPrisma.user.findUnique.mockResolvedValue(otherUser);
      mockPrisma.appraisalSession.findUnique.mockResolvedValue(mockSession);

      const input = {
        sessionId: "sess-1",
        scores: [{ competencyId: "comp-1", actualLevel: 2 }],
      };

      await expect(saveEvaluationDraftAction(input)).rejects.toThrow("Unauthorized to edit this session");
    });

    it("should reject submit when session is already SUBMITTED", async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-1" } } as any);
      mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, role: Role.HR_ADMIN });
      mockPrisma.appraisalSession.findUnique.mockResolvedValue({
        ...mockSession,
        status: AppraisalStatus.SUBMITTED,
      });

      const input = {
        sessionId: "sess-1",
        scores: [{ competencyId: "comp-1", actualLevel: 2 }],
      };

      await expect(submitManagerEvaluationAction(input)).rejects.toThrow("Cannot submit evaluation in SUBMITTED status");
    });

    it("should reject when competency is not assigned", async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-1" } } as any);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.appraisalSession.findUnique.mockResolvedValue(mockSession);

      const mockTx = {
        appraisalScoreItem: { deleteMany: vi.fn(), createMany: vi.fn() },
        iDPItem: { deleteMany: vi.fn(), createMany: vi.fn() },
        appraisalSession: { update: vi.fn().mockResolvedValue({ id: "sess-1", status: AppraisalStatus.PENDING_EVALUATION }) },
      };
      mockPrisma.$transaction.mockImplementation(async (callback) => callback(mockTx));

      const input = {
        sessionId: "sess-1",
        scores: [{ competencyId: "comp-unknown", actualLevel: 2 }],
      };

      await expect(saveEvaluationDraftAction(input)).rejects.toThrow("Competency comp-unknown not assigned to employee");
    });

    it("should persist IDP when idpItems are provided", async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-1" } } as any);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.appraisalSession.findUnique.mockResolvedValue(mockSession);
      
      const mockTx = {
        appraisalScoreItem: { deleteMany: vi.fn(), createMany: vi.fn() },
        iDPItem: { deleteMany: vi.fn(), createMany: vi.fn() },
        appraisalSession: { update: vi.fn().mockResolvedValue({ id: "sess-1", status: AppraisalStatus.PENDING_EVALUATION }) },
      };
      
      mockPrisma.$transaction.mockImplementation(async (callback) => callback(mockTx));

      const input = {
        sessionId: "sess-1",
        scores: [
          { competencyId: "comp-1", actualLevel: 2 },
        ],
        idpItems: [
          {
            competencyId: "comp-1",
            actionPlan: "Read a book",
            targetDate: "2026-12-31T00:00:00.000Z",
          }
        ]
      };

      await saveEvaluationDraftAction(input);

      expect(mockTx.iDPItem.deleteMany).toHaveBeenCalledWith({ where: { sessionId: "sess-1" } });
      expect(mockTx.iDPItem.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            competencyId: "comp-1",
            actionPlan: "Read a book",
            targetDate: new Date("2026-12-31T00:00:00.000Z"),
          }),
        ],
      });
    });

    it("should throw Unauthorized if userId is missing and no session", async () => {
      (getServerSession as any).mockResolvedValue(null);

      const input = {
        sessionId: "sess-1",
        scores: [{ competencyId: "comp-1", actualLevel: 2 }],
      };

      await expect(saveEvaluationDraftAction(input)).rejects.toThrow("Unauthorized");
    });

    it("should resolve userId from getServerSession if providedUserId is omitted", async () => {
      (getServerSession as any).mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.appraisalSession.findUnique.mockResolvedValue(mockSession);

      const mockTx = {
        appraisalScoreItem: { deleteMany: vi.fn(), createMany: vi.fn() },
        iDPItem: { deleteMany: vi.fn(), createMany: vi.fn() },
        appraisalSession: { update: vi.fn().mockResolvedValue({ id: "sess-1" }) },
      };
      
      mockPrisma.$transaction.mockImplementation(async (callback) => callback(mockTx));

      const input = {
        sessionId: "sess-1",
        scores: [{ competencyId: "comp-1", actualLevel: 2 }],
      };

      await saveEvaluationDraftAction(input); 

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: "user-1" } });
    });
  });
});
