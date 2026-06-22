import { useState } from 'react';
import { useAccountHistory, useSaveAccountSnapshot } from '../hooks/useApi.js';
import { Card } from '../components/Card.jsx';
import { fmt } from '../utils/format.js';
import { ACCOUNTS } from '../config/accounts.js';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const NOW = new Date();
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function Wealth() {
  const year = NOW.getFullYear();
  const { data: history = [] } = useAccountHistory(year);
  const saveSnapshot = useSaveAccountSnapshot();
  const [balances, setBalances] = useState({});

  const byMonth = {};
  history.forEach(s => {
    if (!byMonth[s.month]) byMonth[s.month] = {};
    byMonth[s.month][s.account_name] = s.balance;
  });

  const trendData = Object.entries(byMonth).map(([m, accs]) => {
    const liquid = ACCOUNTS.filter(a => a.is_liquid).reduce((s, a) => s + (accs[a.name] || 0), 0);
    return { month: MONTHS[Number(m) - 1], liquid };
  });

  const latestMonth = Math.max(...Object.keys(byMonth).map(Number), 0);
  const latestBalances = latestMonth > 0 ? byMonth[latestMonth] : {};
  const liquidNW = ACCOUNTS.filter(a => a.is_liquid).reduce((s, a) => s + (latestBalances[a.name] || 0), 0);

  const handleSave = () => {
    const snapshots = ACCOUNTS.map(a => ({
      account_name: a.name,
      account_type: a.type,
      institution: a.institution,
      balance: Number(balances[a.name] || 0),
      is_liquid: a.is_liquid ? 1 : 0,
    }));
    saveSnapshot.mutate({ snapshots, month: NOW.getMonth() + 1, year });
  };

  return (
    <div className="p-6">
      <h1 className="text-[#F1F5F9] text-lg font-semibold mb-2">Wealth Snapshot {year}</h1>
      <div className="mono text-[#10B981] text-3xl font-semibold mb-6">{fmt(liquidNW)} <span className="text-[#94A3B8] text-base">liquid net worth</span></div>

      {trendData.length > 1 && (
        <Card className="mb-6">
          <div className="text-[#94A3B8] text-xs uppercase tracking-wide mb-3">Liquid NW Trend</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={trendData}>
              <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ background: '#1A2236', border: '1px solid #1E293B', borderRadius: 8 }} />
              <Line type="monotone" dataKey="liquid" stroke="#3B82F6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <div className="text-[#94A3B8] text-xs uppercase tracking-wide mb-3">Update Balances</div>
          <div className="space-y-2">
            {ACCOUNTS.map(a => (
              <div key={a.name} className="flex items-center gap-3">
                <div className="flex-1 text-sm text-[#F1F5F9]">{a.name}</div>
                <input
                  type="number"
                  placeholder="0"
                  value={balances[a.name] || ''}
                  onChange={e => setBalances(b => ({ ...b, [a.name]: e.target.value }))}
                  className="w-32 bg-[#111827] border border-[#1E293B] rounded-lg px-2 py-1 text-sm mono text-[#F1F5F9] text-right"
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleSave}
            className="mt-4 w-full bg-[#3B82F6] rounded-lg py-2 text-sm text-white hover:bg-blue-500"
          >
            Save Snapshot
          </button>
        </Card>

        <Card>
          <div className="text-[#94A3B8] text-xs uppercase tracking-wide mb-3">Latest Balances</div>
          <div className="space-y-2">
            <div className="text-[#94A3B8] text-xs mb-2">Liquid</div>
            {ACCOUNTS.filter(a => a.is_liquid).map(a => (
              <div key={a.name} className="flex justify-between text-sm">
                <span className="text-[#F1F5F9]">{a.name}</span>
                <span className="mono text-[#F1F5F9]">{latestBalances[a.name] != null ? fmt(latestBalances[a.name]) : '—'}</span>
              </div>
            ))}
            <div className="text-[#94A3B8] text-xs mt-3 mb-2">Tracked (excluded from liquid NW)</div>
            {ACCOUNTS.filter(a => !a.is_liquid).map(a => (
              <div key={a.name} className="flex justify-between text-sm">
                <span className="text-[#94A3B8]">{a.name}</span>
                <span className="mono text-[#94A3B8]">{latestBalances[a.name] != null ? fmt(latestBalances[a.name]) : '—'}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
