import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, BarChart3, Ticket, CreditCard, TrendingUp, Layers, Smartphone } from 'lucide-react';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/month', icon: CalendarDays, label: 'Month' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/jtt', icon: Ticket, label: 'JTT' },
  { to: '/amex', icon: CreditCard, label: 'Amex' },
  { to: '/wealth', icon: TrendingUp, label: 'Wealth' },
  { to: '/cards', icon: Layers, label: 'Cards' },
  { to: '/mobile', icon: Smartphone, label: 'Mobile' },
];

export function Nav() {
  return (
    <nav className="fixed top-0 left-0 h-full w-16 bg-[#111827] border-r border-[#1E293B] flex flex-col items-center py-6 gap-1 z-50">
      <div className="text-[#3B82F6] font-bold text-xs mb-6 mono">RD</div>
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          title={label}
          className={({ isActive }) =>
            `w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${isActive ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1A2236]'}`
          }
        >
          <Icon size={18} />
        </NavLink>
      ))}
    </nav>
  );
}
