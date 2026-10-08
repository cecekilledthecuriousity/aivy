import { describe, it, expect } from 'vitest';
import { calculateTnaSummary, SessionWithScoresAndDepartment } from '../../src/lib/tna-calculator';
import { AppraisalStatus, Role } from '@prisma/client';

describe('TNA Calculator', () => {
  const createMockSession = (
    employeeId: string,
    departmentName: string,
    scoreItems: any[]
  ): SessionWithScoresAndDepartment => {
    return {
      id: `session-${employeeId}`,
      periodId: 'period-1',
      employeeId,
      evaluatorId: 'eval-1',
      status: AppraisalStatus.PUBLISHED,
      managerNotes: null,
      hrNotes: null,
      submittedAt: new Date(),
      approvedAt: new Date(),
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      employee: {
        id: employeeId,
        email: `${employeeId}@example.com`,
        name: `Employee ${employeeId}`,
        passwordHash: 'hash',
        role: Role.EMPLOYEE,
        jobTitle: 'Staff',
        employeeCode: `EMP-${employeeId}`,
        departmentId: 'dept-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        managerId: null,
        department: {
          id: 'dept-1',
          name: departmentName,
          code: 'DEPT',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      scoreItems: scoreItems.map((item, index) => ({
        id: `score-${index}`,
        sessionId: `session-${employeeId}`,
        competencyId: item.competency.id,
        standardLevel: item.standardLevel,
        actualLevel: item.actualLevel,
        gapValue: item.actualLevel - item.standardLevel,
        gapLabel: item.gapLabel,
        managerComment: null,
        competency: {
          id: item.competency.id,
          code: item.competency.code,
          name: item.competency.name,
          category: item.competency.category,
          description: 'Desc',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })),
    };
  };

  const compA = { id: 'comp-1', code: 'C1', name: 'Competency A', category: 'Core' };
  const compB = { id: 'comp-2', code: 'C2', name: 'Competency B', category: 'Tech' };
  const compC = { id: 'comp-3', code: 'C3', name: 'Competency C', category: 'Lead' };

  it('should handle empty sessions', () => {
    const result = calculateTnaSummary([]);
    expect(result).toEqual([]);
  });

  it('should ignore zero or positive gaps', () => {
    const sessions = [
      createMockSession('1', 'IT', [
        { competency: compA, standardLevel: 3, actualLevel: 3, gapLabel: '0' },
        { competency: compB, standardLevel: 2, actualLevel: 3, gapLabel: '+1' },
      ]),
    ];
    const result = calculateTnaSummary(sessions);
    expect(result).toEqual([]);
  });

  it('should group negative gaps by competency and separate critical/moderate', () => {
    const sessions = [
      createMockSession('1', 'IT', [
        { competency: compA, standardLevel: 4, actualLevel: 1, gapLabel: '-3' }, // Critical
        { competency: compB, standardLevel: 3, actualLevel: 2, gapLabel: '-1' }, // Moderate
      ]),
      createMockSession('2', 'HR', [
        { competency: compA, standardLevel: 4, actualLevel: 2, gapLabel: '-2' }, // Moderate
      ]),
    ];

    const result = calculateTnaSummary(sessions);

    expect(result).toHaveLength(2);
    
    const resA = result.find(r => r.competencyId === compA.id);
    expect(resA).toBeDefined();
    expect(resA?.totalDeficitCount).toBe(2);
    expect(resA?.criticalCount).toBe(1);
    expect(resA?.moderateCount).toBe(1);
    expect(resA?.suggestedTrainingUrgency).toBe('CRITICAL');
    expect(resA?.affectedEmployees).toHaveLength(2);

    const resB = result.find(r => r.competencyId === compB.id);
    expect(resB).toBeDefined();
    expect(resB?.totalDeficitCount).toBe(1);
    expect(resB?.criticalCount).toBe(0);
    expect(resB?.moderateCount).toBe(1);
    expect(resB?.suggestedTrainingUrgency).toBe('MODERATE');
  });

  it('should sort by urgency (criticalCount DESC, totalDeficitCount DESC)', () => {
    const sessions = [
      createMockSession('1', 'IT', [
        { competency: compA, standardLevel: 3, actualLevel: 2, gapLabel: '-1' }, // 1 moderate
        { competency: compB, standardLevel: 4, actualLevel: 1, gapLabel: '-3' }, // 1 critical
        { competency: compC, standardLevel: 4, actualLevel: 1, gapLabel: '-3' }, // 1 critical
      ]),
      createMockSession('2', 'IT', [
        { competency: compB, standardLevel: 4, actualLevel: 1, gapLabel: '-3' }, // 1 critical
      ]),
      createMockSession('3', 'IT', [
        { competency: compA, standardLevel: 3, actualLevel: 2, gapLabel: '-1' }, // 1 moderate
      ]),
    ];

    const result = calculateTnaSummary(sessions);

    // Expected order:
    // compB: 2 critical, 0 moderate -> total 2
    // compC: 1 critical, 0 moderate -> total 1
    // compA: 0 critical, 2 moderate -> total 2

    expect(result[0].competencyId).toBe(compB.id);
    expect(result[1].competencyId).toBe(compC.id);
    expect(result[2].competencyId).toBe(compA.id);
  });
});
