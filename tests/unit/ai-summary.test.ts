import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateEmployeeSummary } from '../../src/lib/ai-summary';
import { prisma } from '../../src/lib/db';

vi.mock('../../src/lib/db', () => {
  return {
    prisma: {
      aISummary: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      appraisalSession: {
        findUnique: vi.fn(),
      }
    }
  }
});

const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: mockGenerateContent
        }
      };
    })
  };
});

describe('AI Summary Engine', () => {
  const mockSessionId = 'session-123';
  const mockSession = {
    id: mockSessionId,
    employee: { name: 'Budi', jobTitle: 'Engineer' },
    evaluator: { name: 'Manager' },
    scoreItems: [
      { gapValue: 1, gapLabel: 'Melampaui standar jabatan', competency: { name: 'Programming' } },
      { gapValue: -2, gapLabel: 'Memerlukan pengembangan', competency: { name: 'Communication' } }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-key';
  });

  it('should return cached summary if it exists and forceRegenerate is false', async () => {
    const cachedData = {
      overviewNarrative: 'Cached overview',
      topStrengthsJson: JSON.stringify(['Strength 1']),
      growthAreasJson: JSON.stringify(['Growth 1']),
      actionRecommendationsJson: JSON.stringify(['Action 1'])
    };

    (prisma.aISummary.findUnique as any).mockResolvedValue(cachedData);

    const result = await generateEmployeeSummary(mockSessionId, false);

    expect(result.overviewNarrative).toBe('Cached overview');
    expect(result.topStrengths).toEqual(['Strength 1']);
    expect(prisma.aISummary.findUnique).toHaveBeenCalledWith({ where: { sessionId: mockSessionId } });
    expect(prisma.appraisalSession.findUnique).not.toHaveBeenCalled();
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('should call Gemini API, parse JSON, and upsert to database if cache miss', async () => {
    (prisma.aISummary.findUnique as any).mockResolvedValue(null);
    (prisma.appraisalSession.findUnique as any).mockResolvedValue(mockSession);

    const apiResponse = {
      overviewNarrative: 'AI overview',
      topStrengths: ['AI Strength'],
      growthAreas: ['AI Growth'],
      actionRecommendations: ['AI Action']
    };

    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(apiResponse)
    });

    const result = await generateEmployeeSummary(mockSessionId);

    expect(mockGenerateContent).toHaveBeenCalled();
    expect(prisma.aISummary.upsert).toHaveBeenCalled();
    expect(result.overviewNarrative).toBe('AI overview');
    expect(result.topStrengths).toEqual(['AI Strength']);
  });

  it('should gracefully fallback if Gemini API throws an error', async () => {
    (prisma.aISummary.findUnique as any).mockResolvedValue(null);
    (prisma.appraisalSession.findUnique as any).mockResolvedValue(mockSession);

    mockGenerateContent.mockRejectedValue(new Error('API Rate Limit'));

    const result = await generateEmployeeSummary(mockSessionId);

    expect(mockGenerateContent).toHaveBeenCalled();
    // It should not crash, but return a fallback result
    expect(result.overviewNarrative).toContain('Penilaian untuk Budi');
    expect(result.topStrengths).toEqual(['Programming (Melampaui standar jabatan)']);
    expect(result.growthAreas).toEqual(['Communication (Memerlukan pengembangan)']);
    expect(prisma.aISummary.upsert).toHaveBeenCalled(); // Should still cache the fallback
  });
});
