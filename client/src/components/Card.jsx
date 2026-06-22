export function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#1A2236] border border-[#1E293B] rounded-xl p-4 ${className}`}>
      {children}
    </div>
  );
}

export function MetricCard({ label, value, sub, status }) {
  const dot = status === 'green' ? 'bg-green-500' : status === 'amber' ? 'bg-amber-500' : status === 'red' ? 'bg-red-500' : 'bg-slate-600';
  return (
    <div className="bg-[#1A2236] border border-[#1E293B] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        {status && <span className={`w-2 h-2 rounded-full ${dot}`} />}
        <span className="text-[#94A3B8] text-sm">{label}</span>
      </div>
      <div className="mono text-[#F1F5F9] text-xl font-semibold">{value}</div>
      {sub && <div className="text-[#94A3B8] text-xs mt-1">{sub}</div>}
    </div>
  );
}
