export function calculateGap(standardLevel: number, actualLevel: number): number {
  if (!Number.isInteger(standardLevel) || standardLevel < 1 || standardLevel > 4) {
    throw new Error('Standard level must be an integer between 1 and 4');
  }
  if (!Number.isInteger(actualLevel) || actualLevel < 1 || actualLevel > 4) {
    throw new Error('Actual level must be an integer between 1 and 4');
  }
  return actualLevel - standardLevel;
}

export function getTdsGapLabel(gap: number): string {
  if (gap <= -4) return 'Memerlukan pengembangan menyeluruh.';
  if (gap === -3) return 'Memerlukan pengembangan intensif.';
  if (gap === -2) return 'Memerlukan pengembangan.';
  if (gap === -1) return 'Memerlukan peningkatan kompetensi.';
  if (gap === 0) return 'Sesuai standar jabatan.';
  return 'Melampaui standar jabatan.';
}

export function getProficiencyDescriptor(level: number): { label: string; description: string } {
  if (!Number.isInteger(level) || level < 1 || level > 4) {
    throw new Error('Level must be an integer between 1 and 4');
  }
  
  const descriptors: Record<number, { label: string; description: string }> = {
    1: { label: 'Pemahaman dasar', description: 'Memiliki pemahaman dasar terkait kompetensi ini.' },
    2: { label: 'Cukup kompeten', description: 'Cukup kompeten dalam menerapkan kompetensi ini.' },
    3: { label: 'Kompeten', description: 'Kompeten dan dapat diandalkan dalam kompetensi ini.' },
    4: { label: 'Ahli', description: 'Ahli dan dapat menjadi rujukan bagi orang lain.' }
  };
  
  return descriptors[level];
}
