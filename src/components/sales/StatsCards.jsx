import React from 'react';
import { Phone, Target, CheckCircle2, TrendingUp } from 'lucide-react';

export default function StatsCards({ stats }) {
  const cards = [
    {
      icon: Phone,
      label: 'Neue Leads',
      value: stats.newLeads,
      color: '#1B365D'
    },
    {
      icon: Target,
      label: 'Aktive Calls',
      value: stats.activeCalls,
      color: '#C9A84C'
    },
    {
      icon: CheckCircle2,
      label: 'Abschlüsse diese Woche',
      value: stats.closedThisWeek,
      color: '#2D5A3D'
    },
    {
      icon: TrendingUp,
      label: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      color: '#1B365D'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{card.label}</p>
                <p className="text-3xl font-bold mt-2" style={{ color: card.color }}>
                  {card.value}
                </p>
              </div>
              <Icon className="w-12 h-12" style={{ color: card.color, opacity: 0.2 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}