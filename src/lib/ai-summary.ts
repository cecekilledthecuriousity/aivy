import { GoogleGenAI } from '@google/genai';
import { prisma } from './db';
import { AppraisalStatus } from '@prisma/client';

export interface AISummaryResult {
  overviewNarrative: string;
  topStrengths: string[];
  growthAreas: string[];
  actionRecommendations: string[];
}

export async function generateEmployeeSummary(
  sessionId: string,
  forceRegenerate: boolean = false
): Promise<AISummaryResult> {
  // 1. Check if cached summary exists
  const existingSummary = await prisma.aISummary.findUnique({
    where: { sessionId },
  });

  if (existingSummary && !forceRegenerate) {
    return {
      overviewNarrative: existingSummary.overviewNarrative,
      topStrengths: JSON.parse(existingSummary.topStrengthsJson),
      growthAreas: JSON.parse(existingSummary.growthAreasJson),
      actionRecommendations: JSON.parse(existingSummary.actionRecommendationsJson),
    };
  }

  // 2. Fetch session data
  const session = await prisma.appraisalSession.findUnique({
    where: { id: sessionId },
    include: {
      employee: {
        include: { department: true }
      },
      evaluator: true,
      scoreItems: {
        include: { competency: true }
      }
    }
  });

  if (!session) {
    throw new Error('AppraisalSession not found');
  }

  // Fallback handler if Gemini fails or no API key
  const fallbackSummary = (): AISummaryResult => {
    const topStrengths = session.scoreItems
      .filter(item => item.gapValue >= 0)
      .map(item => `${item.competency.name} (${item.gapLabel})`);
    
    const growthAreas = session.scoreItems
      .filter(item => item.gapValue < 0)
      .map(item => `${item.competency.name} (${item.gapLabel})`);

    return {
      overviewNarrative: `Penilaian untuk ${session.employee.name} (${session.employee.jobTitle}) telah diselesaikan. Terdapat beberapa area yang sudah memenuhi standar dan area yang perlu ditingkatkan.`,
      topStrengths: topStrengths.length > 0 ? topStrengths : ['Belum ada data kekuatan menonjol'],
      growthAreas: growthAreas.length > 0 ? growthAreas : ['Tidak ada kesenjangan kompetensi signifikan'],
      actionRecommendations: ['Tinjau hasil penilaian secara berkala', 'Diskusikan rencana pengembangan dengan manager'],
    };
  };

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found. Using fallback summary.');
      return await saveSummary(sessionId, fallbackSummary());
    }

    const ai = new GoogleGenAI({ apiKey });

    // Construct prompt
    let prompt = `Anda adalah seorang HR Expert. Buatlah ringkasan naratif (AI Summary) untuk hasil evaluasi matriks kompetensi karyawan.
Karyawan: ${session.employee.name}
Jabatan: ${session.employee.jobTitle}
Departemen: ${session.employee.department?.name || '-'}
Catatan Manager: ${session.managerNotes || 'Tidak ada'}

Data Kompetensi:\n`;

    session.scoreItems.forEach(item => {
      prompt += `- ${item.competency.name}: Standar ${item.standardLevel}, Aktual ${item.actualLevel}, GAP ${item.gapValue} (${item.gapLabel})\n`;
      if (item.managerComment) {
        prompt += `  Catatan: ${item.managerComment}\n`;
      }
    });

    prompt += `
Buatkan hasil evaluasi dalam format JSON murni TANPA markdown block, dengan skema berikut:
{
  "overviewNarrative": "string (Ringkasan naratif keseluruhan performa)",
  "topStrengths": ["string", "string"], // Maksimal 3 kekuatan utama (GAP >= 0)
  "growthAreas": ["string", "string"], // Maksimal 3 area pengembangan (GAP < 0)
  "actionRecommendations": ["string", "string"] // Rekomendasi aksi pengembangan/pelatihan
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const textResult = response.text || '{}';
    const parsedResult = JSON.parse(textResult) as AISummaryResult;

    return await saveSummary(sessionId, parsedResult);

  } catch (error) {
    console.error('Gemini API Error:', error);
    // Graceful fallback
    return await saveSummary(sessionId, fallbackSummary());
  }
}

async function saveSummary(sessionId: string, result: AISummaryResult): Promise<AISummaryResult> {
  await prisma.aISummary.upsert({
    where: { sessionId },
    update: {
      overviewNarrative: result.overviewNarrative,
      topStrengthsJson: JSON.stringify(result.topStrengths),
      growthAreasJson: JSON.stringify(result.growthAreas),
      actionRecommendationsJson: JSON.stringify(result.actionRecommendations),
      generatedAt: new Date(),
    },
    create: {
      sessionId,
      overviewNarrative: result.overviewNarrative,
      topStrengthsJson: JSON.stringify(result.topStrengths),
      growthAreasJson: JSON.stringify(result.growthAreas),
      actionRecommendationsJson: JSON.stringify(result.actionRecommendations),
    },
  });

  return result;
}
