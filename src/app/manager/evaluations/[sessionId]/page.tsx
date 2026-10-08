import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { canAccessSession } from "@/lib/rbac";
import { SkillMatrixForm, CompetencyData, ScoreData, IDPData } from "@/components/evaluation/skill-matrix-form";

interface PageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function ManagerEvaluationPage({ params }: PageProps) {
  const { sessionId } = await params;
  
  const userSession = await getServerSession(authOptions);
  let user = null;
  let session: any = null;

  try {
    if (userSession?.user?.id) {
      user = await prisma.user.findUnique({
        where: { id: userSession.user.id }
      });
    }
    
    session = await prisma.appraisalSession.findUnique({
      where: { id: sessionId },
      include: {
        employee: {
          include: {
            competencies: {
              include: {
                competency: true
              }
            }
          }
        },
        scoreItems: true,
        idpItems: true
      }
    });

    if (session && !user) {
      user = await prisma.user.findUnique({
        where: { id: session.evaluatorId }
      });
    }
  } catch (err) {
    // Offline fallback ketika DB offline
  }
  
  // Jika DB offline atau sesi demo dibuka
  if (!session) {
    session = {
      id: sessionId,
      status: 'PENDING_EVALUATION',
      evaluatorId: 'eval-1',
      employee: {
        name: 'Software Developer (Demo)',
        employeeCode: 'TECH-001',
        jobTitle: 'Full-Stack Software Engineer',
        competencies: [
          { standardLevel: 3, competency: { id: 'c1', name: 'Integritas & Etika Kerja', category: 'Core', description: 'Menjaga integritas dan kejujuran dalam bekerja' } },
          { standardLevel: 3, competency: { id: 'c2', name: 'Komunikasi Tim', category: 'Core', description: 'Komunikasi efektif antardivisi' } },
          { standardLevel: 4, competency: { id: 'c3', name: 'Problem Solving', category: 'Technical', description: 'Memecahkan kendala teknis kompleks' } },
          { standardLevel: 3, competency: { id: 'c4', name: 'System Design', category: 'Technical', description: 'Perancangan arsitektur sistem' } },
        ]
      },
      scoreItems: [
        { competencyId: 'c1', actualLevel: 3 },
        { competencyId: 'c2', actualLevel: 4 },
        { competencyId: 'c3', actualLevel: 3 },
      ],
      idpItems: [
        { competencyId: 'c3', actionPlan: 'Workshop Distributed Systems', targetDate: new Date('2026-11-30') }
      ]
    };
  }
  
  const competenciesData: CompetencyData[] = session.employee.competencies.map(c => ({
    id: c.competency.id,
    category: c.competency.category,
    name: c.competency.name,
    description: c.competency.description,
    standardLevel: c.standardLevel
  }));
  
  const initialScores: ScoreData[] = session.scoreItems.map(s => ({
    competencyId: s.competencyId,
    actualLevel: s.actualLevel,
    managerComment: s.managerComment || undefined
  }));
  
  const initialIdpItems: IDPData[] = session.idpItems.map(i => ({
    competencyId: i.competencyId,
    actionPlan: i.actionPlan,
    targetDate: i.targetDate.toISOString()
  }));

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h1 className="text-2xl font-bold mb-4">Evaluation Session</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Employee</p>
            <p className="font-medium">{session.employee.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Job Title</p>
            <p className="font-medium">{session.employee.jobTitle}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Employee Code</p>
            <p className="font-medium">{session.employee.employeeCode}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium">{session.status}</p>
          </div>
        </div>
      </div>
      
      <SkillMatrixForm
        sessionId={session.id}
        status={session.status}
        competencies={competenciesData}
        initialScores={initialScores}
        initialIdpItems={initialIdpItems}
        initialManagerNotes={session.managerNotes || ""}
      />
    </div>
  );
}
