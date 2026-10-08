import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppraisalStatus } from "@prisma/client";
import { CompetencyRadarChart } from "@/components/charts/competency-radar-chart";
import { GapBadge } from "@/components/evaluation/gap-badge";
import { IDPTrackerTable } from "@/components/idp/idp-tracker-table";

function safeParseJsonArray(val?: string | null): string[] {
  try {
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

export default async function MyEvaluationPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return <div>Unauthorized</div>;
  }

  const evaluation = await prisma.appraisalSession.findFirst({
    where: {
      employeeId: session.user.id,
      status: AppraisalStatus.PUBLISHED
    },
    include: {
      scoreItems: {
        include: {
          competency: true
        }
      },
      idpItems: {
        include: {
          competency: true
        }
      },
      aiSummary: true,
      evaluator: true,
      period: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (!evaluation) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">My Evaluation</h1>
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md">
          Your appraisal is currently in progress or has not been published yet.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
        <h1 className="text-2xl font-bold mb-2">My Evaluation Report</h1>
        <p className="text-gray-600">Period: {evaluation.period.name}</p>
        <p className="text-gray-600">Evaluator: {evaluation.evaluator.name}</p>
      </div>

      {evaluation.aiSummary && (
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4">AI Summary</h2>
          <div className="mb-4">
            <h3 className="font-semibold">Overview</h3>
            <p className="text-gray-700">{evaluation.aiSummary.overviewNarrative}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-green-700 mb-2">Top Strengths</h3>
              <ul className="list-disc pl-5">
                {safeParseJsonArray(evaluation.aiSummary.topStrengthsJson).map((s: string, i: number) => (
                  <li key={i} className="text-gray-700">{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-amber-700 mb-2">Growth Areas</h3>
              <ul className="list-disc pl-5">
                {safeParseJsonArray(evaluation.aiSummary.growthAreasJson).map((s: string, i: number) => (
                  <li key={i} className="text-gray-700">{s}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold text-blue-700 mb-2">Action Recommendations</h3>
            <ul className="list-disc pl-5">
              {safeParseJsonArray(evaluation.aiSummary.actionRecommendationsJson).map((s: string, i: number) => (
                <li key={i} className="text-gray-700">{s}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Competency Assessment</h2>
        <CompetencyRadarChart items={evaluation.scoreItems} />
        
        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Standard</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gap</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {evaluation.scoreItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.competency.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.standardLevel}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.actualLevel}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <GapBadge gap={item.gapValue} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Individual Development Plan (IDP)</h2>
        <IDPTrackerTable idpItems={evaluation.idpItems} />
      </div>
    </div>
  );
}
