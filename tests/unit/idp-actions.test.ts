import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateIDPStatusAction } from '@/actions/idp';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { IDPStatus, Role } from '@prisma/client';

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    iDPItem: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('updateIDPStatusAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates IDP item status successfully to IN_PROGRESS when user is employee', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'emp-1', role: Role.EMPLOYEE, departmentId: 'dept-1', employeeCode: 'EMP001' },
      expires: '123'
    } as any);

    vi.mocked(prisma.iDPItem.findUnique).mockResolvedValue({
      id: 'idp-1',
      sessionId: 'sess-1',
      competencyId: 'comp-1',
      actionPlan: 'Learn something',
      targetDate: new Date(),
      status: IDPStatus.PLANNED,
      createdAt: new Date(),
      updatedAt: new Date(),
      session: {
        employeeId: 'emp-1',
        evaluatorId: 'mgr-1'
      }
    } as any);

    vi.mocked(prisma.iDPItem.update).mockResolvedValue({} as any);

    await updateIDPStatusAction('idp-1', IDPStatus.IN_PROGRESS);

    expect(prisma.iDPItem.update).toHaveBeenCalledWith({
      where: { id: 'idp-1' },
      data: { status: IDPStatus.IN_PROGRESS }
    });
  });

  it('updates IDP item status successfully to COMPLETED when user is manager (evaluator)', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'mgr-1', role: Role.MANAGER, departmentId: 'dept-1', employeeCode: 'MGR001' },
      expires: '123'
    } as any);

    vi.mocked(prisma.iDPItem.findUnique).mockResolvedValue({
      id: 'idp-1',
      session: {
        employeeId: 'emp-1',
        evaluatorId: 'mgr-1'
      }
    } as any);

    vi.mocked(prisma.iDPItem.update).mockResolvedValue({} as any);

    await updateIDPStatusAction('idp-1', IDPStatus.COMPLETED);

    expect(prisma.iDPItem.update).toHaveBeenCalledWith({
      where: { id: 'idp-1' },
      data: { status: IDPStatus.COMPLETED }
    });
  });

  it('rejects unauthorized user', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'other-emp', role: Role.EMPLOYEE, departmentId: 'dept-1', employeeCode: 'EMP002' },
      expires: '123'
    } as any);

    vi.mocked(prisma.iDPItem.findUnique).mockResolvedValue({
      id: 'idp-1',
      session: {
        employeeId: 'emp-1',
        evaluatorId: 'mgr-1'
      }
    } as any);

    await expect(updateIDPStatusAction('idp-1', IDPStatus.IN_PROGRESS)).rejects.toThrow('Forbidden');
  });

  it('handles non-existent IDP item', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'emp-1', role: Role.EMPLOYEE, departmentId: 'dept-1', employeeCode: 'EMP001' },
      expires: '123'
    } as any);

    vi.mocked(prisma.iDPItem.findUnique).mockResolvedValue(null);

    await expect(updateIDPStatusAction('idp-1', IDPStatus.IN_PROGRESS)).rejects.toThrow('IDP item not found');
  });
});
