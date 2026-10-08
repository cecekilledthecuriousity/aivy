import { describe, it, expect } from 'vitest';
import { authorizeRole, canAccessSession, canEditSession } from '../../src/lib/rbac';
import { Role, AppraisalStatus } from '@prisma/client';

describe('RBAC Guards', () => {
  describe('authorizeRole', () => {
    it('should return true if currentRole is in allowedRoles', () => {
      expect(authorizeRole(Role.HR_ADMIN, [Role.HR_ADMIN, Role.MANAGER])).toBe(true);
      expect(authorizeRole(Role.MANAGER, [Role.MANAGER])).toBe(true);
    });

    it('should return false if currentRole is not in allowedRoles', () => {
      expect(authorizeRole(Role.EMPLOYEE, [Role.HR_ADMIN, Role.MANAGER])).toBe(false);
    });
  });

  describe('canAccessSession', () => {
    const sessionBase = { employeeId: 'emp1', evaluatorId: 'mgr1' };

    it('HR_ADMIN can view all sessions regardless of status', () => {
      const user = { id: 'admin1', role: Role.HR_ADMIN };
      expect(canAccessSession(user, { ...sessionBase, status: AppraisalStatus.PENDING_EVALUATION })).toBe(true);
      expect(canAccessSession(user, { ...sessionBase, status: AppraisalStatus.PUBLISHED })).toBe(true);
    });

    it('MANAGER can view session if they are the evaluator', () => {
      const user = { id: 'mgr1', role: Role.MANAGER };
      expect(canAccessSession(user, { ...sessionBase, status: AppraisalStatus.PENDING_EVALUATION })).toBe(true);
      expect(canAccessSession(user, { ...sessionBase, status: AppraisalStatus.PUBLISHED })).toBe(true);
    });

    it('MANAGER cannot view session if they are not the evaluator and session is not published', () => {
      const user = { id: 'mgr2', role: Role.MANAGER };
      expect(canAccessSession(user, { ...sessionBase, status: AppraisalStatus.PENDING_EVALUATION })).toBe(false);
    });

    it('MANAGER who is the employee being evaluated must only view their own appraisal if session.status is PUBLISHED', () => {
      const user = { id: 'mgr_emp', role: Role.MANAGER };
      const ownSession = { employeeId: 'mgr_emp', evaluatorId: 'admin1' };
      expect(canAccessSession(user, { ...ownSession, status: AppraisalStatus.PENDING_EVALUATION })).toBe(false);
      expect(canAccessSession(user, { ...ownSession, status: AppraisalStatus.PUBLISHED })).toBe(true);
    });

    it('EMPLOYEE can view their own session ONLY when status is PUBLISHED', () => {
      const user = { id: 'emp1', role: Role.EMPLOYEE };
      expect(canAccessSession(user, { ...sessionBase, status: AppraisalStatus.PUBLISHED })).toBe(true);
    });

    it('EMPLOYEE cannot view their own session when status is not PUBLISHED', () => {
      const user = { id: 'emp1', role: Role.EMPLOYEE };
      expect(canAccessSession(user, { ...sessionBase, status: AppraisalStatus.PENDING_EVALUATION })).toBe(false);
      expect(canAccessSession(user, { ...sessionBase, status: AppraisalStatus.SUBMITTED })).toBe(false);
      expect(canAccessSession(user, { ...sessionBase, status: AppraisalStatus.NEEDS_REVISION })).toBe(false);
      expect(canAccessSession(user, { ...sessionBase, status: AppraisalStatus.APPROVED })).toBe(false);
    });

    it('EMPLOYEE cannot view another employee\'s session even if PUBLISHED', () => {
      const user = { id: 'emp2', role: Role.EMPLOYEE };
      expect(canAccessSession(user, { ...sessionBase, status: AppraisalStatus.PUBLISHED })).toBe(false);
    });
  });

  describe('canEditSession', () => {
    const sessionBase = { evaluatorId: 'mgr1' };

    it('HR_ADMIN can edit session (calibration/approval)', () => {
      const user = { id: 'admin1', role: Role.HR_ADMIN };
      expect(canEditSession(user, { ...sessionBase, status: AppraisalStatus.SUBMITTED })).toBe(true);
      expect(canEditSession(user, { ...sessionBase, status: AppraisalStatus.APPROVED })).toBe(true);
      expect(canEditSession(user, { ...sessionBase, status: AppraisalStatus.PUBLISHED })).toBe(true);
    });

    it('MANAGER can edit session ONLY if evaluatorId matches AND status is PENDING_EVALUATION or NEEDS_REVISION', () => {
      const user = { id: 'mgr1', role: Role.MANAGER };
      expect(canEditSession(user, { ...sessionBase, status: AppraisalStatus.PENDING_EVALUATION })).toBe(true);
      expect(canEditSession(user, { ...sessionBase, status: AppraisalStatus.NEEDS_REVISION })).toBe(true);
    });

    it('MANAGER cannot edit session if status is SUBMITTED, APPROVED, or PUBLISHED', () => {
      const user = { id: 'mgr1', role: Role.MANAGER };
      expect(canEditSession(user, { ...sessionBase, status: AppraisalStatus.SUBMITTED })).toBe(false);
      expect(canEditSession(user, { ...sessionBase, status: AppraisalStatus.APPROVED })).toBe(false);
      expect(canEditSession(user, { ...sessionBase, status: AppraisalStatus.PUBLISHED })).toBe(false);
    });

    it('MANAGER cannot edit session if they are not the evaluator', () => {
      const user = { id: 'mgr2', role: Role.MANAGER };
      expect(canEditSession(user, { ...sessionBase, status: AppraisalStatus.PENDING_EVALUATION })).toBe(false);
    });

    it('EMPLOYEE can never edit a session', () => {
      const user = { id: 'emp1', role: Role.EMPLOYEE };
      expect(canEditSession(user, { ...sessionBase, status: AppraisalStatus.PENDING_EVALUATION })).toBe(false);
      expect(canEditSession(user, { ...sessionBase, status: AppraisalStatus.NEEDS_REVISION })).toBe(false);
    });
  });
});
