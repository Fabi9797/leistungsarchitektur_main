import React from 'react';
import { Badge } from '@/components/ui/badge';

const statusColors = {
  'Vorbereitung': '#FFB800',
  'Aktiv': '#2563EB',
  'Abgeschlossen': '#10B981',
  'Nicht konvertiert': '#EF4444'
};

export default function SalesCallTable({ calls, onRowClick }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Lead Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Schritt</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Datum</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ergebnis</th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call) => (
            <tr
              key={call.id}
              onClick={() => onRowClick(call)}
              className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">{call.lead_name}</td>
              <td className="px-6 py-4">
                <Badge style={{ backgroundColor: statusColors[call.status] }} className="text-white">
                  {call.status}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                Schritt {call.current_step}/9
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {call.call_date ? new Date(call.call_date).toLocaleDateString('de-DE') : '-'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {call.ergebnis || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}