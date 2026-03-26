import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import StepGoalCard from './StepGoalCard';

export default function Step6({ call, stepGoal, onDataChange }) {
  const [kaufmotive, setKaufmotive] = useState(
    call.kaufmotive_json ? JSON.parse(call.kaufmotive_json) : []
  );
  const [newMotiv, setNewMotiv] = useState('');

  const handleAdd = () => {
    if (newMotiv.trim()) {
      const updated = [...kaufmotive, newMotiv];
      setKaufmotive(updated);
      onDataChange('kaufmotive_json', JSON.stringify(updated));
      setNewMotiv('');
    }
  };

  const handleRemove = (index) => {
    const updated = kaufmotive.filter((_, i) => i !== index);
    setKaufmotive(updated);
    onDataChange('kaufmotive_json', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      <StepGoalCard goal={stepGoal} />

      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4" style={{ color: '#1B365D' }}>Kaufmotive</h3>

        <div className="space-y-3 mb-6">
          {kaufmotive.map((motiv, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <span className="text-sm text-gray-700">{motiv}</span>
              <button
                onClick={() => handleRemove(i)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={newMotiv}
            onChange={(e) => setNewMotiv(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Neues Kaufmotiv hinzufügen..."
            className="flex-1"
          />
          <Button
            onClick={handleAdd}
            style={{ backgroundColor: '#1B365D' }}
            className="text-white"
          >
            Hinzufügen
          </Button>
        </div>
      </Card>
    </div>
  );
}