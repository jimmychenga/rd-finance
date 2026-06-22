import { useAmex, useAmexRoi } from '../hooks/useApi.js';
import { Card } from '../components/Card.jsx';
import { fmt, pct } from '../utils/format.js';

const NOW = new Date();

export function Amex() {
  const year = NOW.getFullYear();
  const { data: credits = [] } = useAmex(year);
  const { data: roi = [] } = useAmexRoi(year);

  const platinum = credits.filter(c => c.card === 'Amex Platinum');
  const gold = credits.filter(c => c.card === 'Amex Gold');

  return (
    <div className="p-6">
      <h1 className="text-[#F1F5F9] text-lg font-semibold mb-6">Amex Tracker {year}</h1>

      <div className="grid grid-cols-2 gap-6">
        {[{ label: 'Amex Platinum', credits: platinum }, { label: 'Amex Gold', credits: gold }].map(({ label, credits: creds }) => {
          const roiData = roi.find(r => r.card === label);
          return (
            <Card key={label}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-[#F1F5F9] font-semibold">{label}</div>
                  {roiData && (
                    <div className="text-[#94A3B8] text-xs mt-0.5">
                      Annual fee: {fmt(roiData.annualFee)} · Credits used: {fmt(roiData.creditsUsed)} · Net: {fmt(roiData.netValue)}
                    </div>
                  )}
                </div>
                {roiData && (
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium ${roiData.status === 'Profitable' ? 'bg-green-500/20 text-green-400' : roiData.status === 'Break-even' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                    {roiData.status}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {creds.map(c => {
                  const ratio = c.max_amount > 0 ? c.used_amount / c.max_amount : 0;
                  const remaining = c.max_amount - c.used_amount;
                  return (
                    <div key={c.id} className="py-1.5 border-b border-[#1E293B] last:border-0">
                      <div className="flex justify-between text-sm mb-1">
                        <div>
                          <span className="text-[#F1F5F9]">{c.benefit_name}</span>
                          <span className="text-[#475569] text-xs ml-2">{c.period_label}</span>
                        </div>
                        <span className="mono text-[#94A3B8] text-xs">
                          {fmt(c.used_amount)} / {fmt(c.max_amount)}
                          {remaining > 0 && <span className="text-amber-400 ml-1">({fmt(remaining)} left)</span>}
                        </span>
                      </div>
                      <div className="h-1 bg-[#1E293B] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${ratio >= 1 ? 'bg-green-500' : ratio > 0 ? 'bg-blue-500' : 'bg-[#1E293B]'}`}
                          style={{ width: `${ratio * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
