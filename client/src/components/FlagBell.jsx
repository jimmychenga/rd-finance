import { Bell } from 'lucide-react';
import { useFlags } from '../hooks/useApi.js';

export function FlagBell({ month, year, onClick }) {
  const { data: flags = [] } = useFlags(month, year);
  return (
    <button onClick={onClick} className="relative text-[#94A3B8] hover:text-[#F1F5F9] transition-colors">
      <Bell size={18} />
      {flags.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
          {flags.length}
        </span>
      )}
    </button>
  );
}
