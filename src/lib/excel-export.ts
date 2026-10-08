import * as xlsx from 'xlsx';
import { prisma } from './db';

export async function generatePeriodExcelWorkbook(periodId: string): Promise<Buffer> {
  const period = await prisma.appraisalPeriod.findUnique({
    where: { id: periodId },
    include: {
      sessions: {
        include: {
          employee: { include: { department: true } },
          scoreItems: { include: { competency: true } }
        }
      }
    }
  });

  if (!period) throw new Error('Period not found');

  const wb = xlsx.utils.book_new();

  // Sheet 1: Master Summary
  const masterData = period.sessions.map(s => {
    const gaps = s.scoreItems.map(item => item.gapValue);
    const avgGap = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
    const negativeGapCount = gaps.filter(g => g < 0).length;

    return {
      'Employee ID': s.employee.employeeCode,
      'Name': s.employee.name,
      'Department': s.employee.department.name,
      'Job Title': s.employee.jobTitle,
      'Average Gap': avgGap.toFixed(2),
      'Negative Gap Count': negativeGapCount,
      'Session Status': s.status
    };
  });
  const ws1 = xlsx.utils.json_to_sheet(masterData);
  xlsx.utils.book_append_sheet(wb, ws1, 'Master Summary');

  // Sheet 2: Competency Matrix Pivot
  // Columns: Employee Name | Comp1 (Act) | Comp1 (Gap) | Comp2 (Act) | Comp2 (Gap)
  // To keep it simple based on instructions: "Employees in rows, Competency codes in columns, cell values showing Actual Level and GAP"
  const pivotData: any[] = [];
  for (const s of period.sessions) {
    const row: any = { 'Employee Name': s.employee.name };
    for (const item of s.scoreItems) {
      row[`${item.competency.code} Actual`] = item.actualLevel;
      row[`${item.competency.code} GAP`] = item.gapValue;
    }
    pivotData.push(row);
  }
  const ws2 = xlsx.utils.json_to_sheet(pivotData);
  xlsx.utils.book_append_sheet(wb, ws2, 'Competency Matrix Pivot');

  // Sheet 3: TNA Priority List
  const tnaData: any[] = [];
  for (const s of period.sessions) {
    for (const item of s.scoreItems) {
      if (item.gapValue < 0) {
        tnaData.push({
          'Employee Name': s.employee.name,
          'Department': s.employee.department.name,
          'Competency Code': item.competency.code,
          'Competency Name': item.competency.name,
          'GAP Severity': item.gapValue
        });
      }
    }
  }
  // Sort by GAP Severity ascending (e.g. -4 before -1)
  tnaData.sort((a, b) => a['GAP Severity'] - b['GAP Severity']);
  
  const ws3 = xlsx.utils.json_to_sheet(tnaData);
  xlsx.utils.book_append_sheet(wb, ws3, 'TNA Priority List');

  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
