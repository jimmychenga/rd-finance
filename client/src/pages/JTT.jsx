import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTickets, useTicketAnalytics } from '../hooks/useApi.js';
import { Card, MetricCard } from '../components/Card.jsx';
import { fmt, pct } from '../utils/format.js';

const STATUS_COLORS = { Sold: 'bg-green-500', Holding: 'bg-amber-500', Lost: 'bg-red-500', Refunded: 'bg-slate-500' };
const NOW = new Date();

export function JTT() {
  const year = NOW.getFullYear();
  const { data: deals = [] } = useTickets(year);
  const { data: analytics } = useTicketAnalytics(year);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[#F1F5F9] text-lg font-semibold">JTT — Just The Ticket {year}</h1>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-[#3B82F6] rounded-lg text-sm text-white hover:bg-blue-500">
          <Plus size={14} /> Add Deal
        </button>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-6">
        <MetricCard label="Realised P&L" value={fmt(analytics?.realisedPnl || 0)} status={(analytics?.realisedPnl || 0) >= 0 ? 'green' : 'red'} />
        <MetricCard label="Capital at Risk" value={fmt(analytics?.capitalAtRisk || 0)} status="amber" />
        <MetricCard label="Total Deals" value={analytics?.totalDeals || 0} sub={`${analytics?.soldCount || 0} sold · ${analytics?.holdingCount || 0} holding`} />
        <MetricCard label="Win Rate" value={pct(analytics?.winRate || 0)} status={(analytics?.winRate || 0) >= 0.7 ? 'green' : 'amber'} />
        <MetricCard label="Avg Profit" value={fmt(analytics?.avgProfit || 0)} status={(analytics?.avgProfit || 0) >= 0 ? 'green' : 'red'} />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#94A3B8] border-b border-[#1E293B]">
                {['Status','Event','Date','Qty','Cost','Revenue','Profit','Source','Sold Via'].map(h => (
                  <th key={h} className="text-left py-2 pr-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deals.length === 0 && (
                <tr><td colSpan={9} className="text-[#475569] py-8 text-center">No deals yet — add your first ticket deal above.</td></tr>
              )}
              {deals.map(d => (
                <tr key={d.id} className="border-b border-[#1E293B] last:border-0 hover:bg-[#111827]">
                  <td className="py-2 pr-4">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[d.status] || 'bg-slate-500'}`} />
                      <span className="text-[#94A3B8] text-xs">{d.status}</span>
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-[#F1F5F9] max-w-[180px] truncate">{d.event_name}</td>
                  <td className="py-2 pr-4 text-[#94A3B8] mono text-xs">{d.event_date}</td>
                  <td className="py-2 pr-4 text-[#94A3B8]">{d.quantity}</td>
                  <td className="py-2 pr-4 mono text-[#F1F5F9]">{fmt(d.total_cost)}</td>
                  <td className="py-2 pr-4 mono text-[#F1F5F9]">{d.net_revenue ? fmt(d.net_revenue) : '—'}</td>
                  <td className={`py-2 pr-4 mono font-medium ${(d.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {d.profit != null ? fmt(d.profit) : '—'}
                  </td>
                  <td className="py-2 pr-4 text-[#94A3B8] text-xs">{d.source || '—'}</td>
                  <td className="py-2 pr-4 text-[#94A3B8] text-xs">{d.sold_on || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {analytics?.sourceLeaderboard?.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card>
            <div className="text-[#94A3B8] text-xs uppercase tracking-wide mb-3">Source Leaderboard</div>
            {analytics.sourceLeaderboard.map(s => (
              <div key={s.source} className="flex justify-between text-sm py-1.5 border-b border-[#1E293B] last:border-0">
                <span className="text-[#F1F5F9]">{s.source}</span>
                <span className="mono text-green-400">{fmt(s.avgProfit)} avg</span>
              </div>
            ))}
          </Card>
          <Card>
            <div className="text-[#94A3B8] text-xs uppercase tracking-wide mb-3">Platform Leaderboard</div>
            {analytics.platformLeaderboard.map(p => (
              <div key={p.platform} className="flex justify-between text-sm py-1.5 border-b border-[#1E293B] last:border-0">
                <span className="text-[#F1F5F9]">{p.platform}</span>
                <span className="mono text-green-400">{fmt(p.profit)}</span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
