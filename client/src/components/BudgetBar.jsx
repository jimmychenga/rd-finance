import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { fmt, pct } from '../utils/format.js';

export function BudgetBar({ category, spent, budget, onSetBudget }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const ratio = budget > 0 ? Math.min(spent / budget, 1) : 0;
  const pctVal = budget > 0 ? spent / budget : 0;
  const barColor = pctVal < 0.7 ? 'bg-green-500' : pctVal < 0.9 ? 'bg-amber-500' : 'bg-red-500';
  const pctColor = pctVal >= 0.9 ? 'text-red-400' : pctVal >= 0.7 ? 'text-amber-400' : 'text-green-400';

  const save = () => {
    const val = parseFloat(draft);
    if (!isNaN(val) && val >= 0 && onSetBudget) onSetBudget(val);
    setEditing(false);
  };

  return (
    <div className="py-2 group">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[#F1F5F9] text-sm">{category}</span>
        <div className="flex items-center gap-2">
          {editing ? (
            <div className="flex items-center gap-1">
              <span className="text-[#94A3B8] text-xs">$</span>
              <input
                autoFocus
                type="number"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
                className="w-20 bg-[#111827] border border-[#3B82F6] rounded px-1.5 py-0.5 text-xs mono text-[#F1F5F9] text-right"
                placeholder="0"
              />
              <button onClick={save} className="text-green-400 hover:text-green-300"><Check size={12} /></button>
              <button onClick={() => setEditing(false)} className="text-[#94A3B8] hover:text-white"><X size={12} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="mono text-sm text-[#94A3B8]">
                <span className={pctVal > 0 ? pctColor : 'text-[#94A3B8]'}>{fmt(spent)}</span>
                {budget > 0 && <span className="text-[#475569]"> / {fmt(budget)}</span>}
                {budget > 0 && <span className={`ml-2 text-xs ${pctColor}`}>{pct(pctVal)}</span>}
                {budget === 0 && <span className="text-[#475569] text-xs ml-2">no budget set</span>}
              </span>
              {onSetBudget && (
                <button
                  onClick={() => { setDraft(budget > 0 ? String(budget) : ''); setEditing(true); }}
                  className="opacity-0 group-hover:opacity-100 text-[#475569] hover:text-[#94A3B8] transition-opacity"
                >
                  <Pencil size={11} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="h-1 bg-[#1E293B] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
