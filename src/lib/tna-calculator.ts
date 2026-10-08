import { AppraisalSession, AppraisalScoreItem, Competency, User, Department } from '@prisma/client';

export type SessionWithScoresAndDepartment = AppraisalSession & {
  employee: User & {
    department: Department;
  };
  scoreItems: (AppraisalScoreItem & {
    competency: Competency;
  })[];
};

export type AffectedEmployee = {
  id: string;
  name: string;
  departmentName: string;
  gapValue: number;
  gapLabel: string;
  actualLevel: number;
  standardLevel: number;
};

export type TnaSummary = {
  competencyId: string;
  competencyCode: string;
  competencyName: string;
  category: string;
  totalDeficitCount: number;
  criticalCount: number;
  moderateCount: number;
  affectedEmployees: AffectedEmployee[];
  suggestedTrainingUrgency: 'CRITICAL' | 'MODERATE';
  recommendedProgram: string;
};

export function calculateTnaSummary(sessions: SessionWithScoresAndDepartment[]): TnaSummary[] {
  const map = new Map<string, TnaSummary>();

  sessions.forEach((session) => {
    session.scoreItems.forEach((item) => {
      if (item.gapValue < 0) {
        const comp = item.competency;
        let summary = map.get(comp.id);
        
        if (!summary) {
          summary = {
            competencyId: comp.id,
            competencyCode: comp.code,
            competencyName: comp.name,
            category: comp.category,
            totalDeficitCount: 0,
            criticalCount: 0,
            moderateCount: 0,
            affectedEmployees: [],
            suggestedTrainingUrgency: 'MODERATE',
            recommendedProgram: '',
          };
          map.set(comp.id, summary);
        }

        summary.totalDeficitCount += 1;
        
        if (item.gapValue <= -3) {
          summary.criticalCount += 1;
        } else {
          summary.moderateCount += 1;
        }

        summary.affectedEmployees.push({
          id: session.employee.id,
          name: session.employee.name,
          departmentName: session.employee.department.name,
          gapValue: item.gapValue,
          gapLabel: item.gapLabel,
          actualLevel: item.actualLevel,
          standardLevel: item.standardLevel,
        });
      }
    });
  });

  const result = Array.from(map.values());

  // Determine urgency and program
  result.forEach((summary) => {
    if (summary.criticalCount > 0) {
      summary.suggestedTrainingUrgency = 'CRITICAL';
      summary.recommendedProgram = 'Intervensi Kritis / Pelatihan Fundamental Wajib';
    } else {
      summary.suggestedTrainingUrgency = 'MODERATE';
      summary.recommendedProgram = 'Masuk Program TNA & Mentoring Terstruktur';
    }
  });

  // Sort: criticalCount descending, then totalDeficitCount descending
  result.sort((a, b) => {
    if (b.criticalCount !== a.criticalCount) {
      return b.criticalCount - a.criticalCount;
    }
    return b.totalDeficitCount - a.totalDeficitCount;
  });

  return result;
}
