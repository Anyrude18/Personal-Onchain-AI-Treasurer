import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Settings2,
  RefreshCw,
  PieChart,
  ShieldCheck,
  Zap,
  X,
} from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/ai-chat', label: 'AI Chat', icon: MessageSquare },
  { path: '/strategy', label: 'Strategy', icon: Settings2 },
  { path: '/subscriptions', label: 'Subscriptions', icon: RefreshCw },
  { path: '/budget', label: 'Budget', icon: PieChart },
  { path: '/audit', label: 'Audit Log', icon: ShieldCheck },
];

export default function Sidebar({ isOpen, onClose }) {
  const { isAgentActive, toggleAgent } = useAppStore();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-60
          bg-[#1a1d27] border-r border-white/[0.07]
          flex flex-col
          transition-transform duration-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#7c6ff7]/20 flex items-center justify-center">
              <Zap size={16} className="text-[#7c6ff7]" fill="#7c6ff7" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm leading-tight">AI Treasurer</div>
              <div className="text-slate-500 text-xs">OnChain</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#7c6ff7]/15 text-[#7c6ff7]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} className={isActive ? 'text-[#7c6ff7]' : 'text-slate-500'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/[0.07]">
          <button
            onClick={toggleAgent}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              isAgentActive
                ? 'bg-[#00c896]/10 text-[#00c896] border border-[#00c896]/20'
                : 'bg-white/[0.03] text-slate-400 border border-white/[0.07] hover:bg-white/[0.06]'
            }`}
          >
            <span className="relative flex items-center justify-center w-4 h-4">
              <span
                className={`w-2.5 h-2.5 rounded-full ${isAgentActive ? 'bg-[#00c896]' : 'bg-slate-600'}`}
              />
              {isAgentActive && (
                <span className="absolute inset-0 rounded-full bg-[#00c896]/40 animate-ping" />
              )}
            </span>
            <span>Agent {isAgentActive ? 'Active' : 'Inactive'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
