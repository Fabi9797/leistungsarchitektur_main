import React from 'react';
import { Card } from '@/components/ui/card';
import { Target } from 'lucide-react';

export default function StepGoalCard({ goal }) {
  if (!goal) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg w-fit" style={{ backgroundColor: '#1B365D15' }}>
      <Target className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#1B365D' }} />
      <p className="text-sm font-semibold" style={{ color: '#1B365D' }}>
        Ziel: {goal}
      </p>
    </div>
  );
}