import { Role, AppraisalStatus } from '@prisma/client';

export function authorizeRole(currentRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(currentRole);
}

export function canAccessSession(
  user: { id: string; role: Role; managerId?: string | null },
  session: { employeeId: string; evaluatorId: string; status: AppraisalStatus }
): boolean {
  if (user.role === Role.HR_ADMIN) return true;

  if (user.role === Role.MANAGER) {
    return session.evaluatorId === user.id || (session.employeeId === user.id && session.status === AppraisalStatus.PUBLISHED);
  }

  if (user.role === Role.EMPLOYEE) {
    return session.employeeId === user.id && session.status === AppraisalStatus.PUBLISHED;
  }

  return false;
}

export function canEditSession(
  user: { id: string; role: Role },
  session: { evaluatorId: string; status: AppraisalStatus }
): boolean {
  if (user.role === Role.HR_ADMIN) return true;

  if (user.role === Role.MANAGER) {
    return session.evaluatorId === user.id && 
           (session.status === AppraisalStatus.PENDING_EVALUATION || session.status === AppraisalStatus.NEEDS_REVISION);
  }

  return false;
}
