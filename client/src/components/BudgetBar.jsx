import { fmt, pct } from '../utils/format.js';

export function BudgetBar({ category, spent, budget, onClick }) {
  const ratio = budget > 0 ? Math.min(spent / budget, 1) : 0;
  const pctVal = budget > 0 ? spent / budget : 0;
  const color = pctVal < 0.7 ? 'bg-green-500' : pctVal < 0.9 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="py-2 cursor-pointer group" onClick={onClick}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[#F1F5F9] text-sm group-hover:text-white">{category}</span>
        <span className="mono text-sm text-[#94A3B8]">
          <span className={pctVal >= 0.9 ? 'text-red-400' : pctVal >= 0.7 ? 'text-amber-400' : 'text-[#94A3B8]'}>{fmt(spent)}</span>
          {budget > 0 && <span className="text-[#475569]"> / {fmt(budget)}</span>}
          {budget > 0 && <span className={`ml-2 text-xs ${pctVal >= 0.9 ? 'text-red-400' : pctVal >= 0.7 ? 'text-amber-400' : 'text-green-400'}`}>{pct(pctVal)}</span>}
        </span>
      </div>
      <div className="h-1 bg-[#1E293B] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  );
}
