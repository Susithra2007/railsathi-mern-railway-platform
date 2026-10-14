import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, CheckCircle, RefreshCw, Luggage } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  category: 'DOCUMENTS' | 'ELECTRONICS' | 'HEALTH' | 'ESSENTIALS';
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  { id: 'item_1', text: 'Original Government Photo ID (Aadhaar / Voter / PAN)', category: 'DOCUMENTS' },
  { id: 'item_2', text: 'E-Ticket PDF or SMS with PNR on Phone', category: 'DOCUMENTS' },
  { id: 'item_3', text: 'Mobile Phone Charger & Charged Power Bank', category: 'ELECTRONICS' },
  { id: 'item_4', text: 'Prescription Medicines & Emergency First Aid', category: 'HEALTH' },
  { id: 'item_5', text: 'Reusable Water Bottle & Sanitizer', category: 'ESSENTIALS' },
  { id: 'item_6', text: 'Warm Travel Jacket or Shawl (for AC Coaches)', category: 'ESSENTIALS' },
  { id: 'item_7', text: 'Light Healthy Snacks / Refreshments', category: 'ESSENTIALS' },
];

export const DepartureChecklist: React.FC = () => {
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('railsathi_checklist');
      return saved ? JSON.parse(saved) : ['item_1', 'item_2'];
    } catch {
      return ['item_1', 'item_2'];
    }
  });

  useEffect(() => {
    localStorage.setItem('railsathi_checklist', JSON.stringify(checkedIds));
  }, [checkedIds]);

  const toggleItem = (id: string) => {
    if (checkedIds.includes(id)) {
      setCheckedIds(checkedIds.filter((i) => i !== id));
    } else {
      setCheckedIds([...checkedIds, id]);
    }
  };

  const resetChecklist = () => {
    setCheckedIds([]);
  };

  const progress = Math.round((checkedIds.length / DEFAULT_ITEMS.length) * 100);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Luggage className="w-4 h-4 text-amber-600" />
          <h3 className="font-bold text-slate-900 text-sm">Departure & Packing Checklist</h3>
        </div>
        <button
          onClick={resetChecklist}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
          title="Reset checklist"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="font-semibold text-slate-700">Journey Readiness</span>
          <span className="font-mono font-bold text-amber-900">{progress}% Ready</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2 pt-1">
        {DEFAULT_ITEMS.map((item) => {
          const isChecked = checkedIds.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`w-full text-left p-3 rounded-lg border text-xs flex items-center justify-between transition-all ${
                isChecked
                  ? 'border-emerald-200 bg-emerald-50/40 text-slate-900'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className={isChecked ? 'line-through text-slate-500' : 'font-medium'}>
                  {item.text}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                {item.category}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
