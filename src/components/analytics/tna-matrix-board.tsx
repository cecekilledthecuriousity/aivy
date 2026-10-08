"use client";

import React, { useState, useMemo } from 'react';
import { TnaSummary } from '@/lib/tna-calculator';
import { Department } from '@prisma/client';
import { ChevronDown, ChevronUp, AlertCircle, Users, BookOpen } from 'lucide-react';

interface TNAMatrixBoardProps {
  tnaSummaries: TnaSummary[];
  departments: Department[];
  totalEmployeesEvaluated: number;
}

export function TNAMatrixBoard({ tnaSummaries, departments, totalEmployeesEvaluated }: TNAMatrixBoardProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const filteredSummaries = useMemo(() => {
    if (selectedDepartment === 'ALL') return tnaSummaries;
    
    return tnaSummaries.map(summary => {
      const filteredEmployees = summary.affectedEmployees.filter(
        emp => emp.departmentName === selectedDepartment
      );
      
      const criticalCount = filteredEmployees.filter(emp => emp.gapValue <= -3).length;
      const moderateCount = filteredEmployees.filter(emp => emp.gapValue > -3).length;
      
      return {
        ...summary,
        affectedEmployees: filteredEmployees,
        totalDeficitCount: filteredEmployees.length,
        criticalCount,
        moderateCount,
        suggestedTrainingUrgency: criticalCount > 0 ? 'CRITICAL' : 'MODERATE' as const,
        recommendedProgram: criticalCount > 0 
          ? 'Intervensi Kritis / Pelatihan Fundamental Wajib' 
          : 'Masuk Program TNA & Mentoring Terstruktur'
      };
    }).filter(summary => summary.totalDeficitCount > 0)
      .sort((a, b) => {
        if (b.criticalCount !== a.criticalCount) return b.criticalCount - a.criticalCount;
        return b.totalDeficitCount - a.totalDeficitCount;
      });
  }, [tnaSummaries, selectedDepartment]);

  const totalDeficits = filteredSummaries.reduce((sum, curr) => sum + curr.totalDeficitCount, 0);
  const criticalNeeds = filteredSummaries.reduce((sum, curr) => sum + curr.criticalCount, 0);

  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedRows(newSet);
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-white rounded-lg shadow border border-gray-200">
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <Users size={20} />
            <h3 className="font-semibold">Total Karyawan Dievaluasi</h3>
          </div>
          <p className="text-3xl font-bold">{totalEmployeesEvaluated}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow border border-gray-200">
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <BookOpen size={20} />
            <h3 className="font-semibold">Total Defisit Kompetensi</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{totalDeficits}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow border border-gray-200">
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <AlertCircle size={20} />
            <h3 className="font-semibold">Kebutuhan Pelatihan Kritis</h3>
          </div>
          <p className="text-3xl font-bold text-red-600">{criticalNeeds}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Prioritas Pelatihan & Pengembangan</h2>
        <div className="flex items-center space-x-2">
          <label htmlFor="dept-filter" className="text-sm font-medium text-gray-700">Filter Departemen:</label>
          <select 
            id="dept-filter"
            value={selectedDepartment} 
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500 block w-48 p-2 border"
          >
            <option value="ALL">Semua Departemen</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.name}>{dept.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kompetensi</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kritis / Moderat</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgensi</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSummaries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  Tidak ada defisit kompetensi yang ditemukan.
                </td>
              </tr>
            ) : filteredSummaries.map(summary => (
              <React.Fragment key={summary.competencyId}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">{summary.competencyName}</span>
                      <span className="text-xs text-gray-500">{summary.competencyCode}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {summary.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-4">
                      <span className="text-red-600 font-bold" title="Kritis (GAP -4, -3)">
                        {summary.criticalCount}
                      </span>
                      <span className="text-yellow-600 font-bold" title="Moderat (GAP -2, -1)">
                        {summary.moderateCount}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {summary.suggestedTrainingUrgency === 'CRITICAL' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        CRITICAL
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        MODERATE
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => toggleRow(summary.competencyId)}
                      className="text-blue-600 hover:text-blue-900 focus:outline-none flex items-center justify-end w-full"
                    >
                      {expandedRows.has(summary.competencyId) ? (
                        <>Tutup <ChevronUp size={16} className="ml-1" /></>
                      ) : (
                        <>Lihat Detail <ChevronDown size={16} className="ml-1" /></>
                      )}
                    </button>
                  </td>
                </tr>
                {expandedRows.has(summary.competencyId) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 bg-gray-50">
                      <div className="rounded-md border border-gray-200 bg-white p-4">
                        <h4 className="text-sm font-semibold mb-3 text-gray-700">Rekomendasi Program: {summary.recommendedProgram}</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-100">
                            <thead>
                              <tr className="text-xs text-gray-500 text-left">
                                <th className="pb-2 font-medium">Karyawan</th>
                                <th className="pb-2 font-medium">Departemen</th>
                                <th className="pb-2 font-medium">Actual / Target</th>
                                <th className="pb-2 font-medium">GAP</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {summary.affectedEmployees.map(emp => (
                                <tr key={emp.id} className="text-sm text-gray-600">
                                  <td className="py-2 font-medium">{emp.name}</td>
                                  <td className="py-2">{emp.departmentName}</td>
                                  <td className="py-2">{emp.actualLevel} / {emp.standardLevel}</td>
                                  <td className="py-2">
                                    <span className={`font-bold ${emp.gapValue <= -3 ? 'text-red-600' : 'text-yellow-600'}`}>
                                      {emp.gapValue > 0 ? `+${emp.gapValue}` : emp.gapValue}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
