import { describe, it, expect } from 'vitest';
import { calculateGap, getTdsGapLabel, getProficiencyDescriptor } from '@/lib/gap-calculator';

describe('TDS Gap Engine', () => {
  it('menghitung GAP aktual - standar dengan benar', () => {
    expect(calculateGap(3, 1)).toBe(-2);
    expect(calculateGap(2, 2)).toBe(0);
    expect(calculateGap(2, 4)).toBe(2);
  });

  it('memetakan label keterangan GAP sesuai standar TDS', () => {
    expect(getTdsGapLabel(-4)).toBe('Memerlukan pengembangan menyeluruh.');
    expect(getTdsGapLabel(-3)).toBe('Memerlukan pengembangan intensif.');
    expect(getTdsGapLabel(-2)).toBe('Memerlukan pengembangan.');
    expect(getTdsGapLabel(-1)).toBe('Memerlukan peningkatan kompetensi.');
    expect(getTdsGapLabel(0)).toBe('Sesuai standar jabatan.');
    expect(getTdsGapLabel(1)).toBe('Melampaui standar jabatan.');
    expect(getTdsGapLabel(2)).toBe('Melampaui standar jabatan.');
  });

  it('mengembalikan deskriptor kemahiran 1-4', () => {
    expect(getProficiencyDescriptor(1).label).toBe('Pemahaman dasar');
    expect(getProficiencyDescriptor(4).label).toBe('Ahli');
  });

  it('menolak input di luar skala 1-4', () => {
    expect(() => calculateGap(0, 3)).toThrow();
    expect(() => calculateGap(2, 5)).toThrow();
  });
});
