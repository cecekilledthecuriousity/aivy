import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateIDPStatusAction } from '@/actions/idp';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { IDPStatus, Role, AppraisalStatus } from '@prisma/client';
import { canAccessSession } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    iDPItem: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// We can just use the actual canAccessSession logic, it's a simple pure function, 
// or mock it if needed. But it's better to let the real one run for integration, 
// since we are testing updateIDPStatusAction which depends on it. 
// Wait, we need to make sure the session returned by findUnique has the correct AppraisalStatus.

describe('updateIDPStatusAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates IDP item status successfully when user is employee and status is PUBLISHED', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'emp-1', role: Role.EMPLOYEE, departmentId: 'dept-1', employeeCode: 'EMP001' },
      expires: '123'
    } as any);

    vi.mocked(prisma.iDPItem.findUnique).mockResolvedValue({
      id: 'idp-1',
      session: {
        employeeId: 'emp-1',
        evaluatorId: 'mgr-1',
        status: AppraisalStatus.PUBLISHED
      }
    } as any);

    vi.mocked(prisma.iDPItem.update).mockResolvedValue({} as any);

    await updateIDPStatusAction('idp-1', IDPStatus.IN_PROGRESS);

    expect(prisma.iDPItem.update).toHaveBeenCalledWith({
      where: { id: 'idp-1' },
      data: { status: IDPStatus.IN_PROGRESS }
    });
    expect(revalidatePath).toHaveBeenCalledWith('/portal/my-evaluation');
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
        evaluatorId: 'mgr-1',
        status: AppraisalStatus.PENDING_EVALUATION
      }
    } as any);

    vi.mocked(prisma.iDPItem.update).mockResolvedValue({} as any);

    await updateIDPStatusAction('idp-1', IDPStatus.COMPLETED);

    expect(prisma.iDPItem.update).toHaveBeenCalledWith({
      where: { id: 'idp-1' },
      data: { status: IDPStatus.COMPLETED }
    });
  });

  it('rejects employee if session is NOT PUBLISHED', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'emp-1', role: Role.EMPLOYEE, departmentId: 'dept-1', employeeCode: 'EMP001' },
      expires: '123'
    } as any);

    vi.mocked(prisma.iDPItem.findUnique).mockResolvedValue({
      id: 'idp-1',
      session: {
        employeeId: 'emp-1',
        evaluatorId: 'mgr-1',
        status: AppraisalStatus.PENDING_EVALUATION
      }
    } as any);

    await expect(updateIDPStatusAction('idp-1', IDPStatus.IN_PROGRESS)).rejects.toThrow('Forbidden');
  });

  it('allows HR_ADMIN to update IDP status regardless of session status', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'hr-1', role: Role.HR_ADMIN, departmentId: 'dept-1', employeeCode: 'HR001' },
      expires: '123'
    } as any);

    vi.mocked(prisma.iDPItem.findUnique).mockResolvedValue({
      id: 'idp-1',
      session: {
        employeeId: 'emp-1',
        evaluatorId: 'mgr-1',
        status: AppraisalStatus.PENDING_EVALUATION
      }
    } as any);

    vi.mocked(prisma.iDPItem.update).mockResolvedValue({} as any);

    await updateIDPStatusAction('idp-1', IDPStatus.IN_PROGRESS);

    expect(prisma.iDPItem.update).toHaveBeenCalled();
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
        evaluatorId: 'mgr-1',
        status: AppraisalStatus.PUBLISHED
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
