import { getTdsGapLabel } from "@/lib/gap-calculator";

interface GapBadgeProps {
  gap: number;
}

export function GapBadge({ gap }: GapBadgeProps) {
  const label = getTdsGapLabel(gap);
  const formattedGap = gap > 0 ? `+${gap}` : gap.toString();
  
  let colorClass = "bg-gray-100 text-gray-800";
  if (gap <= -3) {
    colorClass = "bg-red-100 text-red-800";
  } else if (gap === -2) {
    colorClass = "bg-orange-100 text-orange-800";
  } else if (gap === -1) {
    colorClass = "bg-amber-100 text-amber-800";
  } else if (gap === 0) {
    colorClass = "bg-blue-100 text-blue-800";
  } else if (gap >= 1) {
    colorClass = "bg-emerald-100 text-emerald-800";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`} data-testid="gap-badge">
      <span className="font-bold mr-1">{formattedGap}</span> - {label}
    </span>
  );
}
