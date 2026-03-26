import React from 'react';
import { Card } from '@/components/ui/card';
import { Target } from 'lucide-react';

export default function StepGoalCard({ goal }) {
  if (!goal) return null;
  return (
    <Card className="p-5" style={{ borderTop: '3px solid #1B365D', backgroundColor: '#F8FAFC' }}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-1.5 rounded-md" style={{ backgroundColor: '#1B365D20' }}>
          <Target className="w-4 h-4" style={{ color: '#1B365D' }} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#1B365D' }}>
            Ziel dieses Schritts
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{goal}</p>
        </div>
      </div>
    </Card>
  );
}