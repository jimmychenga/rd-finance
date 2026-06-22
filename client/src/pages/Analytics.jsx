import { useState } from 'react';
import { useYearlySummary } from '../hooks/useApi.js';
import { Card } from '../components/Card.jsx';
import { fmt } from '../utils/format.js';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const NOW = new Date();

export function Analytics() {
  const [tab, setTab] = useState('spending');
  const { data: yearly = [] } = useYearlySummary(NOW.getFullYear());

  const chartData = yearly.map((m, i) => ({ month: MONTHS[i], ...m }));

  const tabs = ['spending', 'income', 'jtt', 'wealth'];

  return (
    <div className="p-6">
      <h1 className="text-[#F1F5F9] text-lg font-semibold mb-4">Analytics {NOW.getFullYear()}</h1>
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize ${tab === t ? 'bg-[#3B82F6] text-white' : 'bg-[#1A2236] text-[#94A3B8] hover:text-white border border-[#1E293B]'}`}
          >
            {t === 'jtt' ? 'JTT' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'spending' && (
        <div className="space-y-6">
          <Card>
            <div className="text-[#94A3B8] text-xs uppercase tracking-wide mb-4">Core vs Choice by Month</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={v => fmt(v)} contentStyle={{ background: '#1A2236', border: '1px solid #1E293B', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="core" name="Core" fill="#3B82F6" radius={[2,2,0,0]} />
                <Bar dataKey="choice" name="Choice" fill="#F59E0B" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <div className="text-[#94A3B8] text-xs uppercase tracking-wide mb-4">Fun Spend % of Income</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData.map(m => ({ ...m, funPct: m.income > 0 ? m.funSpend / m.income * 100 : 0 }))}>
                <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `${v}%`} tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={v => `${v.toFixed(1)}%`} contentStyle={{ background: '#1A2236', border: '1px solid #1E293B', borderRadius: 8 }} />
                <Line type="monotone" dataKey="funPct" name="Fun %" stroke="#F59E0B" strokeWidth={2} dot={false} />
                {/* 25% target line */}
                <Line type="monotone" dataKey={() => 25} name="Target 25%" stroke="#10B981" strokeDasharray="4 4" strokeWidth={1} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {tab !== 'spending' && (
        <Card>
          <div className="text-[#475569] text-sm py-12 text-center">
            {tab === 'income' && 'Income & savings analytics — available in Phase 2'}
            {tab === 'jtt' && 'JTT analytics — built in the JTT module'}
            {tab === 'wealth' && 'Wealth trend — enter monthly balances in the Wealth page'}
          </div>
        </Card>
      )}
    </div>
  );
}
