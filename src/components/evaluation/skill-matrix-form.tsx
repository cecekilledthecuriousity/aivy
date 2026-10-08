"use client";

import { useState, useMemo } from "react";
import { AppraisalStatus } from "@prisma/client";
import { CompetencyRadarChart, ChartInputItem } from "@/components/charts/competency-radar-chart";
import { GapBadge } from "@/components/evaluation/gap-badge";
import { saveEvaluationDraftAction, submitManagerEvaluationAction } from "@/actions/evaluation";
import { EvaluationInput } from "@/schemas/evaluation-schema";

export interface CompetencyData {
  id: string;
  category: string;
  name: string;
  description: string;
  standardLevel: number;
}

export interface ScoreData {
  competencyId: string;
  actualLevel: number;
  managerComment?: string;
}

export interface IDPData {
  competencyId: string;
  actionPlan: string;
  targetDate: string;
}

interface SkillMatrixFormProps {
  sessionId: string;
  status: AppraisalStatus;
  competencies: CompetencyData[];
  initialScores: ScoreData[];
  initialIdpItems: IDPData[];
  initialManagerNotes: string;
}

export function SkillMatrixForm({
  sessionId,
  status,
  competencies,
  initialScores,
  initialIdpItems,
  initialManagerNotes
}: SkillMatrixFormProps) {
  const isLocked = status === "SUBMITTED" || status === "APPROVED" || status === "PUBLISHED";
  
  const [scores, setScores] = useState<Record<string, ScoreData>>(
    initialScores.reduce((acc, score) => ({ ...acc, [score.competencyId]: score }), {})
  );
  
  const [idpItems, setIdpItems] = useState<Record<string, IDPData>>(
    initialIdpItems.reduce((acc, item) => ({ ...acc, [item.competencyId]: item }), {})
  );
  
  const [managerNotes, setManagerNotes] = useState(initialManagerNotes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  const handleScoreChange = (competencyId: string, actualLevel: number) => {
    if (isLocked) return;
    setScores(prev => ({
      ...prev,
      [competencyId]: { ...prev[competencyId], competencyId, actualLevel }
    }));
  };

  const handleCommentChange = (competencyId: string, managerComment: string) => {
    if (isLocked) return;
    setScores(prev => ({
      ...prev,
      [competencyId]: { ...prev[competencyId], competencyId, managerComment }
    }));
  };

  const handleIdpChange = (competencyId: string, field: keyof IDPData, value: string) => {
    if (isLocked) return;
    setIdpItems(prev => ({
      ...prev,
      [competencyId]: {
        ...prev[competencyId],
        competencyId,
        [field]: value
      }
    }));
  };

  const chartItems: ChartInputItem[] = useMemo(() => {
    return competencies.map(c => ({
      competency: { name: c.name },
      standardLevel: c.standardLevel,
      actualLevel: scores[c.id]?.actualLevel || 0
    }));
  }, [competencies, scores]);

  const handleSaveDraft = async () => {
    setIsDrafting(true);
    try {
      const input: EvaluationInput = {
        sessionId,
        managerNotes,
        scores: Object.values(scores),
        idpItems: Object.values(idpItems)
      };
      await saveEvaluationDraftAction(input);
      alert("Draft saved successfully");
    } catch (err) {
      alert("Failed to save draft");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSubmit = async () => {
    if (!confirm("Are you sure you want to submit? It cannot be edited after.")) return;
    setIsSubmitting(true);
    try {
      const input: EvaluationInput = {
        sessionId,
        managerNotes,
        scores: Object.values(scores),
        idpItems: Object.values(idpItems).filter(item => {
          const comp = competencies.find(c => c.id === item.competencyId);
          if (!comp) return false;
          const score = scores[comp.id]?.actualLevel || 0;
          return score > 0 && score - comp.standardLevel < 0;
        })
      };
      await submitManagerEvaluationAction(input);
      alert("Evaluation submitted successfully");
      window.location.reload();
    } catch (err) {
      alert("Failed to submit evaluation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold">Skill Matrix Assessment</h2>
          
          <div className="space-y-6">
            {competencies.map(comp => {
              const currentScore = scores[comp.id]?.actualLevel || 0;
              const gap = currentScore > 0 ? currentScore - comp.standardLevel : 0;
              const hasGap = currentScore > 0 && gap < 0;

              return (
                <div key={comp.id} className="border p-4 rounded-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sm text-gray-500">{comp.category}</div>
                      <h3 className="font-semibold text-lg">{comp.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{comp.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Standard: {comp.standardLevel}</div>
                      {currentScore > 0 && (
                        <div className="mt-2">
                          <GapBadge gap={gap} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Actual Level</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4].map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => handleScoreChange(comp.id, level)}
                          disabled={isLocked}
                          className={`px-4 py-2 rounded border ${currentScore === level ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Manager Comments</label>
                    <textarea
                      value={scores[comp.id]?.managerComment || ''}
                      onChange={(e) => handleCommentChange(comp.id, e.target.value)}
                      disabled={isLocked}
                      className="w-full border rounded p-2"
                      rows={2}
                    />
                  </div>

                  {hasGap && (
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-md mt-4 space-y-4">
                      <h4 className="font-medium text-orange-800">Individual Development Plan (IDP)</h4>
                      <p className="text-sm text-orange-700">Gap detected. Please provide an action plan.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Action Plan</label>
                          <input
                            type="text"
                            value={idpItems[comp.id]?.actionPlan || ''}
                            onChange={(e) => handleIdpChange(comp.id, 'actionPlan', e.target.value)}
                            disabled={isLocked}
                            className="w-full border rounded p-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Target Date</label>
                          <input
                            type="date"
                            value={idpItems[comp.id]?.targetDate ? idpItems[comp.id].targetDate.split('T')[0] : ''}
                            onChange={(e) => handleIdpChange(comp.id, 'targetDate', e.target.value)}
                            disabled={isLocked}
                            className="w-full border rounded p-2"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <h3 className="font-bold">General Manager Notes</h3>
            <textarea
              value={managerNotes}
              onChange={(e) => setManagerNotes(e.target.value)}
              disabled={isLocked}
              className="w-full border rounded p-2"
              rows={4}
            />
          </div>

          {!isLocked && (
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isDrafting || isSubmitting}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                {isDrafting ? 'Saving...' : 'Simpan Draf'}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isDrafting || isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Penilaian'}
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-4 border rounded-md p-4">
            <h3 className="font-bold mb-4">Competency Radar</h3>
            <CompetencyRadarChart items={chartItems} />
          </div>
        </div>
      </div>
    </div>
  );
}
