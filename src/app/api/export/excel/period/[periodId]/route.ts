import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generatePeriodExcelWorkbook } from '@/lib/excel-export';
import { Role } from '@prisma/client';

export async function GET(req: Request, { params }: { params: Promise<{ periodId: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== Role.HR_ADMIN) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const { periodId } = await params;

  const period = await prisma.appraisalPeriod.findUnique({
    where: { id: periodId }
  });

  if (!period) {
    return NextResponse.json({ message: 'Not Found' }, { status: 404 });
  }

  const excelBuffer = await generatePeriodExcelWorkbook(periodId);

  const headers = new Headers();
  headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  headers.set('Content-Disposition', `attachment; filename="rekap-evaluasi-${period.name}.xlsx"`);

  return new NextResponse(new Uint8Array(excelBuffer), { status: 200, headers });
}
