import { useState } from 'react';
import { ChevronLeft, ChevronRight, Upload, Plus } from 'lucide-react';
import { useTransactions, useBudgetTargets, useSummary } from '../hooks/useApi.js';
import { Card } from '../components/Card.jsx';
import { BudgetBar } from '../components/BudgetBar.jsx';
import { fmt, monthFull } from '../utils/format.js';

const NOW = new Date();

export function MonthDetail() {
  const [month, setMonth] = useState(NOW.getMonth() + 1);
  const [year, setYear] = useState(NOW.getFullYear());
  const [filterType, setFilterType] = useState('');

  const { data: transactions = [] } = useTransactions(month, year);
  const { data: summary } = useSummary(month, year);
  const { data: budgetTargets = [] } = useBudgetTargets(month, year);

  const targetMap = Object.fromEntries(budgetTargets.map(t => [t.category, t.target_amount]));
  const byCategory = summary?.byCategory || {};

  const filtered = filterType ? transactions.filter(t => t.type === filterType) : transactions;
  const jttTxs = transactions.filter(t => t.type === 'JTT');

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="text-[#94A3B8] hover:text-white"><ChevronLeft size={18} /></button>
          <h1 className="text-[#F1F5F9] text-lg font-semibold">{monthFull(month)} {year}</h1>
          <button onClick={nextMonth} className="text-[#94A3B8] hover:text-white"><ChevronRight size={18} /></button>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1A2236] border border-[#1E293B] rounded-lg text-sm text-[#94A3B8] hover:text-white">
            <Upload size={14} /> Import CSV
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#3B82F6] rounded-lg text-sm text-white hover:bg-blue-500">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_2fr] gap-6">
        <div className="space-y-4">
          <Card>
            <div className="text-[#94A3B8] text-xs uppercase tracking-wide mb-3">Budget vs Actual</div>
            {Object.entries(byCategory).filter(([, v]) => v > 0).map(([cat, spent]) => (
              <BudgetBar key={cat} category={cat} spent={spent} budget={targetMap[cat] || 0} />
            ))}
          </Card>

          {jttTxs.length > 0 && (
            <Card>
              <div className="text-[#94A3B8] text-xs uppercase tracking-wide mb-3">JTT Activity — not personal spend</div>
              {jttTxs.map(t => (
                <div key={t.id} className="flex justify-between text-sm py-1">
                  <span className="text-[#F1F5F9]">{t.description}</span>
                  <span className="mono text-amber-400">{fmt(t.amount)}</span>
                </div>
              ))}
            </Card>
          )}
        </div>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="text-[#94A3B8] text-xs uppercase tracking-wide">Transactions</div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-[#111827] border border-[#1E293B] rounded-lg text-sm text-[#94A3B8] px-2 py-1"
            >
              <option value="">All types</option>
              {['Income','Core','Choice','Compound','JTT'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            {filtered.length === 0 && <div className="text-[#475569] text-sm py-4 text-center">No transactions — import a CSV to populate.</div>}
            {filtered.map(t => (
              <div key={t.id} className="flex justify-between items-center py-2 border-b border-[#1E293B] last:border-0 text-sm">
                <div className="flex-1">
                  <div className="text-[#F1F5F9]">{t.description}</div>
                  <div className="text-[#475569] text-xs">{t.date} · {t.category} · {t.payment_card || '—'}</div>
                </div>
                <div className={`mono font-medium ml-4 ${t.type === 'Income' ? 'text-green-400' : t.type === 'JTT' ? 'text-amber-400' : 'text-[#F1F5F9]'}`}>
                  {t.type === 'Income' ? '+' : ''}{fmt(t.amount)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
