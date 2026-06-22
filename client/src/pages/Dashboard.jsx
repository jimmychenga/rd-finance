import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSummary, useTransactions, useBudgetTargets, useFlags, useTicketAnalytics } from '../hooks/useApi.js';
import { Card, MetricCard } from '../components/Card.jsx';
import { BudgetBar } from '../components/BudgetBar.jsx';
import { MoneyMapScore } from '../components/MoneyMapScore.jsx';
import { FlagBell } from '../components/FlagBell.jsx';
import { fmt, pct, monthFull } from '../utils/format.js';
import { FUN_CATEGORIES } from '../config/categories.js';

const NOW = new Date();

export function Dashboard() {
  const [month, setMonth] = useState(NOW.getMonth() + 1);
  const [year, setYear] = useState(NOW.getFullYear());
  const [showFlags, setShowFlags] = useState(false);

  const { data: summary } = useSummary(month, year);
  const { data: transactions = [] } = useTransactions(month, year);
  const { data: budgetTargets = [] } = useBudgetTargets(month, year);
  const { data: flags = [] } = useFlags(month, year);
  const { data: jttAnalytics } = useTicketAnalytics(year);

  const targetMap = Object.fromEntries(budgetTargets.map(t => [t.category, t.target_amount]));

  const income = summary?.income || 0;
  const core = summary?.core || 0;
  const choice = summary?.choice || 0;
  const compound = summary?.compound || 0;
  const cash = summary?.cash || 0;
  const funSpend = summary?.funSpend || 0;
  const byCategory = summary?.byCategory || {};

  const choiceCategories = Object.entries(byCategory)
    .filter(([cat]) => !FUN_CATEGORIES.includes(cat) && cat !== 'Income' && byCategory[cat] > 0)
    .sort((a, b) => b[1] - a[1]);

  const recentTxs = [...transactions].slice(0, 10);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  return (
    <div className="p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="text-[#94A3B8] hover:text-white"><ChevronLeft size={18} /></button>
          <h1 className="text-[#F1F5F9] text-lg font-semibold">{monthFull(month)} {year}</h1>
          <button onClick={nextMonth} className="text-[#94A3B8] hover:text-white"><ChevronRight size={18} /></button>
        </div>
        <div className="flex items-center gap-4">
          <MoneyMapScore score={summary?.moneyMapScore || 0} />
          <div className="mono text-[#10B981] text-xl font-semibold">{fmt(income)}</div>
          <FlagBell month={month} year={year} onClick={() => setShowFlags(s => !s)} />
        </div>
      </div>

      {/* Flags panel */}
      {showFlags && flags.length > 0 && (
        <div className="mb-6 space-y-2">
          {flags.map((f, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${f.severity === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-blue-500/10 border-blue-500/30 text-blue-300'}`}>
              <span>{f.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-[2fr_3fr] gap-6">
        {/* Left panel */}
        <div className="space-y-4">
          <Card>
            <div className="text-[#94A3B8] text-xs uppercase tracking-wide mb-3">Income</div>
            <div className="mono text-[#F1F5F9] text-2xl font-semibold mb-1">{fmt(income)}</div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Core"
              value={fmt(core)}
              sub={income > 0 ? pct(core / income) + ' of income' : '—'}
              status={core / income < 0.5 ? 'green' : core / income < 0.7 ? 'amber' : 'red'}
            />
            <MetricCard
              label="Choice"
              value={fmt(choice)}
              sub={income > 0 ? pct(choice / income) + ' of income' : '—'}
              status={choice / income < 0.25 ? 'green' : choice / income < 0.35 ? 'amber' : 'red'}
            />
            <MetricCard
              label="Compound"
              value={fmt(compound)}
              sub={income > 0 ? pct(compound / income) + ' of income' : '—'}
              status={compound / income >= 0.15 ? 'green' : 'amber'}
            />
            <MetricCard
              label="Cash Remaining"
              value={fmt(cash)}
              sub={income > 0 ? pct(cash / income) + ' of income' : '—'}
              status={cash >= 0 ? 'green' : 'red'}
            />
          </div>

          {/* Recent transactions */}
          <Card>
            <div className="text-[#94A3B8] text-xs uppercase tracking-wide mb-3">Recent</div>
            <div className="space-y-2">
              {recentTxs.length === 0 && <div className="text-[#475569] text-sm">No transactions</div>}
              {recentTxs.map(t => (
                <div key={t.id} className="flex justify-between items-start text-sm">
                  <div>
                    <div className="text-[#F1F5F9] truncate max-w-[160px]">{t.description}</div>
                    <div className="text-[#475569] text-xs">{t.category}</div>
                  </div>
                  <div className={`mono font-medium ${t.type === 'Income' ? 'text-green-400' : 'text-[#F1F5F9]'}`}>
                    {t.type === 'Income' ? '+' : ''}{fmt(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Fun Spend highlight */}
          <Card>
            <div className="flex justify-between items-center mb-2">
              <div className="text-[#F1F5F9] font-medium">Dining & Entertainment</div>
              <div className={`mono text-lg font-semibold ${funSpend / income > 0.25 ? 'text-red-400' : 'text-[#F1F5F9]'}`}>
                {fmt(funSpend)}
                {income > 0 && <span className="text-sm ml-2 text-[#94A3B8]">{pct(funSpend / income)}</span>}
              </div>
            </div>
            <div className="h-1 bg-[#1E293B] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${funSpend / income > 0.25 ? 'bg-red-500' : funSpend / income > 0.15 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min((funSpend / income) / 0.25 * 100, 100)}%` }}
              />
            </div>
            <div className="text-[#475569] text-xs mt-1">Target: 25% of income = {fmt(income * 0.25)}</div>
            {/* Subcategory drill */}
            <div className="mt-3 space-y-1 border-t border-[#1E293B] pt-3">
              {FUN_CATEGORIES.map(cat => {
                const amt = byCategory[cat] || 0;
                return amt > 0 ? (
                  <div key={cat} className="flex justify-between text-sm">
                    <span className="text-[#94A3B8]">{cat}</span>
                    <span className="mono text-[#F1F5F9]">{fmt(amt)}</span>
                  </div>
                ) : null;
              })}
            </div>
          </Card>

          {/* Budget bars */}
          <Card>
            <div className="text-[#94A3B8] text-xs uppercase tracking-wide mb-3">Category Spend</div>
            <div className="divide-y divide-[#1E293B]">
              {choiceCategories.map(([cat, spent]) => (
                <BudgetBar key={cat} category={cat} spent={spent} budget={targetMap[cat] || 0} />
              ))}
              {choiceCategories.length === 0 && <div className="text-[#475569] text-sm py-2">No spend data — import transactions to get started.</div>}
            </div>
          </Card>

          {/* Bottom strip */}
          <div className="grid grid-cols-3 gap-3">
            <MetricCard
              label="JTT P&L YTD"
              value={fmt(jttAnalytics?.realisedPnl || 0)}
              sub={`${jttAnalytics?.holdingCount || 0} holding`}
              status={(jttAnalytics?.realisedPnl || 0) >= 0 ? 'green' : 'red'}
            />
            <MetricCard
              label="Capital at Risk"
              value={fmt(jttAnalytics?.capitalAtRisk || 0)}
              sub={`${jttAnalytics?.holdingCount || 0} events`}
              status="amber"
            />
            <MetricCard
              label="Win Rate"
              value={pct(jttAnalytics?.winRate || 0)}
              sub={`${jttAnalytics?.soldCount || 0} sold`}
              status={(jttAnalytics?.winRate || 0) >= 0.7 ? 'green' : 'amber'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
