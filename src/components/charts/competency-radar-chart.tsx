"use client";

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
} from "recharts";

export interface ChartInputItem {
  competency: {
    name: string;
  };
  standardLevel: number;
  actualLevel: number;
}

export interface RadarData {
  competencyName: string;
  standard: number;
  actual: number;
  fullMark: number;
}

export function transformToRadarData(items: ChartInputItem[]): RadarData[] {
  return items.map((item) => ({
    competencyName: item.competency.name,
    standard: item.standardLevel,
    actual: item.actualLevel,
    fullMark: 4,
  }));
}

interface CompetencyRadarChartProps {
  items: ChartInputItem[];
}

export function CompetencyRadarChart({ items }: CompetencyRadarChartProps) {
  const data = transformToRadarData(items);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as RadarData;
      const gap = dataPoint.actual - dataPoint.standard;
      const formattedGap = gap > 0 ? `+${gap}` : gap.toString();
      
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-sm rounded-md text-sm">
          <p className="font-bold mb-1">{dataPoint.competencyName}</p>
          <p className="text-slate-500">Standard: {dataPoint.standard}</p>
          <p className="text-indigo-600">Actual: {dataPoint.actual}</p>
          <p className="font-medium mt-1">GAP: {formattedGap}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="competencyName" tick={{ fill: '#64748b', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fill: '#94a3b8' }} tickCount={5} />
          
          <Radar
            name="Standard (Target)"
            dataKey="standard"
            stroke="#94a3b8"
            strokeDasharray="4 4"
            fill="none"
            strokeWidth={2}
          />
          <Radar
            name="Actual (Pencapaian)"
            dataKey="actual"
            stroke="#4f46e5"
            fill="#6366f1"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
