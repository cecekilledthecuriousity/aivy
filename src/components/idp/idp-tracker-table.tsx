"use client";

import { useState } from "react";
import { IDPStatus } from "@prisma/client";
import { updateIDPStatusAction } from "@/actions/idp";

interface IDPItemProp {
  id: string;
  actionPlan: string;
  targetDate: Date;
  status: IDPStatus;
  competency: {
    name: string;
  };
}

export function IDPTrackerTable({ idpItems }: { idpItems: IDPItemProp[] }) {
  const [items, setItems] = useState(idpItems);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: IDPStatus) => {
    setLoadingId(id);
    try {
      await updateIDPStatusAction(id, newStatus);
      setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item));
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competency</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action Plan</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.competency.name}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{item.actionPlan}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(item.targetDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center gap-2">
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value as IDPStatus)}
                    disabled={loadingId === item.id}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value={IDPStatus.PLANNED}>Planned</option>
                    <option value={IDPStatus.IN_PROGRESS}>In Progress</option>
                    <option value={IDPStatus.COMPLETED}>Completed</option>
                  </select>
                  {loadingId === item.id && <span className="text-xs text-indigo-500 shrink-0">Updating...</span>}
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                No IDP items found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
