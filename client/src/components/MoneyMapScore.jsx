export function MoneyMapScore({ score }) {
  return (
    <div className="flex items-center gap-1" title={`Money Map Score: ${score}/3`}>
      {[0, 1, 2].map(i => (
        <span key={i} className={`w-3 h-3 rounded-full ${i < score ? 'bg-[#3B82F6]' : 'bg-[#1E293B]'}`} />
      ))}
      <span className="text-[#94A3B8] text-xs ml-1 mono">{score}/3</span>
    </div>
  );
}
