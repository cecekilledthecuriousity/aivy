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
  if (!userSession?.user) {
    return <div>Unauthorized</div>;
  }
  
  const user = await prisma.user.findUnique({
    where: { id: userSession.user.id }
  });
  
  if (!user) {
    return <div>User not found</div>;
  }
  
  const session = await prisma.appraisalSession.findUnique({
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
  
  if (!session) {
    notFound();
  }
  
  if (!canAccessSession(user, session)) {
    return <div>Forbidden: You do not have access to this session.</div>;
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
