import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { calculateTnaSummary, SessionWithScoresAndDepartment } from "@/lib/tna-calculator";
import { TNAMatrixBoard } from "@/components/analytics/tna-matrix-board";

export default async function TNAAnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'HR_ADMIN') {
    redirect('/'); // Redirect to home or unauthorized
  }

  // Fetch active period
  const activePeriod = await prisma.appraisalPeriod.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  });

  const periodFilter = activePeriod ? { periodId: activePeriod.id } : {};

  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' }
  });

  const rawSessions = await prisma.appraisalSession.findMany({
    where: {
      ...periodFilter,
    },
    include: {
      employee: {
        include: {
          department: true
        }
      },
      scoreItems: {
        include: {
          competency: true
        }
      }
    }
  });

  // Calculate TNA summary
  const tnaSummaries = calculateTnaSummary(rawSessions as unknown as SessionWithScoresAndDepartment[]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dasbor Training Needs Analysis (TNA)</h1>
        <p className="text-gray-600 mt-2">
          Analisis defisit kompetensi dan prioritas pelatihan {activePeriod ? `untuk periode ${activePeriod.name}` : ''}
        </p>
      </div>

      <TNAMatrixBoard 
        tnaSummaries={tnaSummaries} 
        departments={departments} 
        totalEmployeesEvaluated={rawSessions.length} 
      />
    </div>
  );
}
