import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { canAccessSession } from '@/lib/rbac';
import { renderToBuffer } from '@react-pdf/renderer';
import { AppraisalPdfDocument } from '@/components/reports/appraisal-pdf-document';
import React from 'react';

export async function GET(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId } = await params;

  const appraisalSession = await prisma.appraisalSession.findUnique({
    where: { id: sessionId },
    include: {
      period: true,
      employee: { include: { department: true } },
      evaluator: true,
      scoreItems: { include: { competency: true } },
      idpItems: { include: { competency: true } },
      aiSummary: true,
    }
  });

  if (!appraisalSession) {
    return NextResponse.json({ message: 'Not Found' }, { status: 404 });
  }

  const hasAccess = canAccessSession(session.user as any, appraisalSession);
  if (!hasAccess) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const pdfBuffer = await renderToBuffer(
    React.createElement(AppraisalPdfDocument, {
      periodName: appraisalSession.period.name,
      employee: appraisalSession.employee,
      department: appraisalSession.employee.department,
      evaluator: appraisalSession.evaluator,
      scoreItems: appraisalSession.scoreItems,
      idpItems: appraisalSession.idpItems,
      aiSummary: appraisalSession.aiSummary,
      managerNotes: appraisalSession.managerNotes
    })
  );

  const headers = new Headers();
  headers.set('Content-Type', 'application/pdf');
  headers.set('Content-Disposition', `attachment; filename="rapor-evaluasi-${appraisalSession.employee.employeeCode}.pdf"`);

  return new NextResponse(pdfBuffer, { status: 200, headers });
}
