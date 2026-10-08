import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getPdfExport } from '@/app/api/export/pdf/[sessionId]/route';
import { GET as getExcelExport } from '@/app/api/export/excel/period/[periodId]/route';
import { Role, AppraisalStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import * as xlsx from 'xlsx';

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    appraisalSession: {
      findUnique: vi.fn(),
    },
    appraisalPeriod: {
      findUnique: vi.fn(),
    },
  },
}));

const mockGetServerSession = vi.mocked(getServerSession);
const mockPrismaSessionFindUnique = vi.mocked(prisma.appraisalSession.findUnique);
const mockPrismaPeriodFindUnique = vi.mocked(prisma.appraisalPeriod.findUnique);

describe('Export Routes Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PDF Export Route', () => {
    it('returns 401 if unauthenticated', async () => {
      mockGetServerSession.mockResolvedValueOnce(null);
      
      const req = new Request('http://localhost/api/export/pdf/sess-123');
      const res = await getPdfExport(req, { params: Promise.resolve({ sessionId: 'sess-123' }) });
      
      expect(res.status).toBe(401);
    });

    it('returns 403 if unauthorized employee', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { id: 'emp-1', role: Role.EMPLOYEE }
      } as any);

      // Session belongs to another employee (emp-2)
      mockPrismaSessionFindUnique.mockResolvedValueOnce({
        id: 'sess-123',
        employeeId: 'emp-2',
        evaluatorId: 'mgr-1',
        status: AppraisalStatus.PUBLISHED,
        period: { name: 'Q1' },
        employee: { name: 'Emp 2', employeeCode: 'E002', department: { name: 'IT' } },
        evaluator: { name: 'Mgr 1' },
        scoreItems: [],
        idpItems: [],
      } as any);

      const req = new Request('http://localhost/api/export/pdf/sess-123');
      const res = await getPdfExport(req, { params: Promise.resolve({ sessionId: 'sess-123' }) });
      
      expect(res.status).toBe(403);
    });

    it('returns 200 with application/pdf if authorized', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { id: 'hr-1', role: Role.HR_ADMIN }
      } as any);

      mockPrismaSessionFindUnique.mockResolvedValueOnce({
        id: 'sess-123',
        employeeId: 'emp-1',
        evaluatorId: 'mgr-1',
        status: AppraisalStatus.PUBLISHED,
        period: { name: 'Q1' },
        employee: { name: 'Emp 1', employeeCode: 'E001', department: { name: 'IT' } },
        evaluator: { name: 'Mgr 1' },
        scoreItems: [],
        idpItems: [],
      } as any);

      const req = new Request('http://localhost/api/export/pdf/sess-123');
      const res = await getPdfExport(req, { params: Promise.resolve({ sessionId: 'sess-123' }) });
      
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('application/pdf');
    });
  });

  describe('Excel Export Route', () => {
    it('returns 403 if caller is EMPLOYEE', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { id: 'emp-1', role: Role.EMPLOYEE }
      } as any);
      
      const req = new Request('http://localhost/api/export/excel/period/per-123');
      const res = await getExcelExport(req, { params: Promise.resolve({ periodId: 'per-123' }) });
      
      expect(res.status).toBe(403);
    });

    it('returns 403 if caller is MANAGER', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { id: 'mgr-1', role: Role.MANAGER }
      } as any);
      
      const req = new Request('http://localhost/api/export/excel/period/per-123');
      const res = await getExcelExport(req, { params: Promise.resolve({ periodId: 'per-123' }) });
      
      expect(res.status).toBe(403);
    });

    it('returns 200 with spreadsheet content-type and valid workbook structure if HR_ADMIN', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { id: 'hr-1', role: Role.HR_ADMIN }
      } as any);

      mockPrismaPeriodFindUnique.mockResolvedValue({
        id: 'per-123',
        name: 'Annual 2026',
        sessions: [
          {
            id: 'sess-1',
            status: AppraisalStatus.PUBLISHED,
            employee: { name: 'Emp 1', employeeCode: 'E001', jobTitle: 'Dev', department: { name: 'IT' } },
            scoreItems: [
              { actualLevel: 3, gapValue: -1, competency: { code: 'TECH-1', name: 'Tech 1' } }
            ]
          }
        ]
      } as any);

      const req = new Request('http://localhost/api/export/excel/period/per-123');
      const res = await getExcelExport(req, { params: Promise.resolve({ periodId: 'per-123' }) });
      
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const wb = xlsx.read(buffer, { type: 'buffer' });
      expect(wb.SheetNames.length).toBeGreaterThanOrEqual(3);
      expect(wb.SheetNames).toContain('Master Summary');
      expect(wb.SheetNames).toContain('Competency Matrix Pivot');
      expect(wb.SheetNames).toContain('TNA Priority List');
    });
  });
});
