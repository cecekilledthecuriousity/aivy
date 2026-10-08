import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestRevisionAction, approveEvaluationAction, publishEvaluationAction } from '@/actions/calibration';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { AppraisalStatus, Role } from '@prisma/client';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    appraisalSession: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock getServerSession
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock authOptions (so we don't try to import and parse real NextAuth options in the test)
vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('Calibration Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockHrSession = {
    user: { id: 'hr-admin-1', role: Role.HR_ADMIN },
  };
  const mockManagerSession = {
    user: { id: 'manager-1', role: Role.MANAGER },
  };

  describe('requestRevisionAction', () => {
    it('should throw Unauthorized if caller is not HR_ADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(mockManagerSession as any);
      await expect(requestRevisionAction('session-1', 'Need more details')).rejects.toThrow('Unauthorized');
    });

    it('should throw error if session is not in SUBMITTED state', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(mockHrSession as any);
      vi.mocked(prisma.appraisalSession.findUnique).mockResolvedValueOnce({ status: AppraisalStatus.PENDING_EVALUATION } as any);

      await expect(requestRevisionAction('session-1', 'Notes')).rejects.toThrow('Invalid state transition');
    });

    it('should update session status to NEEDS_REVISION and save hrNotes', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(mockHrSession as any);
      vi.mocked(prisma.appraisalSession.findUnique).mockResolvedValueOnce({ status: AppraisalStatus.SUBMITTED } as any);
      vi.mocked(prisma.appraisalSession.update).mockResolvedValueOnce({} as any);

      await requestRevisionAction('session-1', 'Needs better IDP');

      expect(prisma.appraisalSession.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: {
          status: AppraisalStatus.NEEDS_REVISION,
          hrNotes: 'Needs better IDP',
        },
      });
    });
  });

  describe('approveEvaluationAction', () => {
    it('should throw Unauthorized if caller is not HR_ADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(mockManagerSession as any);
      await expect(approveEvaluationAction('session-1')).rejects.toThrow('Unauthorized');
    });

    it('should update session status to APPROVED and set approvedAt', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(mockHrSession as any);
      vi.mocked(prisma.appraisalSession.findUnique).mockResolvedValueOnce({ status: AppraisalStatus.SUBMITTED } as any);
      vi.mocked(prisma.appraisalSession.update).mockResolvedValueOnce({} as any);

      await approveEvaluationAction('session-1', 'Good job');

      expect(prisma.appraisalSession.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: {
          status: AppraisalStatus.APPROVED,
          hrNotes: 'Good job',
          approvedAt: expect.any(Date),
        },
      });
    });
  });

  describe('publishEvaluationAction', () => {
    it('should throw Unauthorized if caller is not HR_ADMIN', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(mockManagerSession as any);
      await expect(publishEvaluationAction('session-1')).rejects.toThrow('Unauthorized');
    });

    it('should update session status to PUBLISHED and set publishedAt', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(mockHrSession as any);
      vi.mocked(prisma.appraisalSession.findUnique).mockResolvedValueOnce({ status: AppraisalStatus.APPROVED } as any);
      vi.mocked(prisma.appraisalSession.update).mockResolvedValueOnce({} as any);

      await publishEvaluationAction('session-1');

      expect(prisma.appraisalSession.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: {
          status: AppraisalStatus.PUBLISHED,
          publishedAt: expect.any(Date),
        },
      });
    });

    it('should throw error if attempting to publish unapproved session', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(mockHrSession as any);
      vi.mocked(prisma.appraisalSession.findUnique).mockResolvedValueOnce({ status: AppraisalStatus.SUBMITTED } as any);

      await expect(publishEvaluationAction('session-1')).rejects.toThrow('Invalid state transition');
    });
  });
});
