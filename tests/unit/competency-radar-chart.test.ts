import { describe, it, expect } from 'vitest';
import { transformToRadarData, ChartInputItem } from '../../src/components/charts/competency-radar-chart';
import { getTdsGapLabel } from '../../src/lib/gap-calculator';

describe('CompetencyRadarChart logic', () => {
  it('transformToRadarData correctly formats input items', () => {
    const input: ChartInputItem[] = [
      {
        competency: { name: 'Communication' },
        standardLevel: 3,
        actualLevel: 2,
      },
      {
        competency: { name: 'Leadership' },
        standardLevel: 4,
        actualLevel: 4,
      }
    ];

    const result = transformToRadarData(input);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      competencyName: 'Communication',
      standard: 3,
      actual: 2,
      fullMark: 4,
    });
    expect(result[1]).toEqual({
      competencyName: 'Leadership',
      standard: 4,
      actual: 4,
      fullMark: 4,
    });
  });

  it('GAP badge labeling logic works correctly (via getTdsGapLabel)', () => {
    expect(getTdsGapLabel(-4)).toBe('Memerlukan pengembangan menyeluruh.');
    expect(getTdsGapLabel(-3)).toBe('Memerlukan pengembangan intensif.');
    expect(getTdsGapLabel(-2)).toBe('Memerlukan pengembangan.');
    expect(getTdsGapLabel(-1)).toBe('Memerlukan peningkatan kompetensi.');
    expect(getTdsGapLabel(0)).toBe('Sesuai standar jabatan.');
    expect(getTdsGapLabel(1)).toBe('Melampaui standar jabatan.');
    expect(getTdsGapLabel(2)).toBe('Melampaui standar jabatan.');
  });
});
