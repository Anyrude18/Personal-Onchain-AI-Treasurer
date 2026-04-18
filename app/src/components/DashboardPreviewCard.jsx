import { motion } from 'framer-motion';

const Sparkline = () => (
  <svg width="100%" height="48" viewBox="0 0 200 48" fill="none" preserveAspectRatio="none">
    <defs>
      <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#00D4AA" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#00D4AA" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M0 36 C20 32, 30 28, 50 22 C70 16, 80 30, 100 24 C120 18, 130 10, 150 8 C170 6, 185 14, 200 10"
      stroke="#00D4AA"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      className="sparkline-path"
    />
    <path
      d="M0 36 C20 32, 30 28, 50 22 C70 16, 80 30, 100 24 C120 18, 130 10, 150 8 C170 6, 185 14, 200 10 L200 48 L0 48 Z"
      fill="url(#sparkGrad)"
    />
  </svg>
);

const activityItems = [
  { icon: '⚡', text: 'Auto-rebalanced portfolio', time: '2m ago' },
  { icon: '📊', text: 'Budget limit warning sent', time: '14m ago' },
  { icon: '✅', text: 'Savings goal reached', time: '1h ago' },
];

export default function DashboardPreviewCard({ large = false }) {
  return (
    <div
      className={`bg-[#111318] border border-white/5 rounded-2xl overflow-hidden ${large ? 'w-full' : ''}`}
      style={{ boxShadow: '0 0 40px rgba(0, 212, 170, 0.08), 0 24px 64px rgba(0,0,0,0.5)' }}
    >
      <div className={`${large ? 'p-8' : 'p-5'}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[#94A3B8] text-xs font-medium tracking-wide uppercase">Total Balance</span>
          <span className="flex items-center gap-1 text-[#00D4AA] text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse" />
            Live
          </span>
        </div>
        <div className={`font-['Sora'] font-bold text-[#E2E8F0] mb-4 ${large ? 'text-4xl' : 'text-2xl'}`}>
          $42,850.00
        </div>

        <div className={`grid grid-cols-3 gap-2.5 mb-4`}>
          {[
            { label: 'Savings', value: '$12,400', color: '#00D4AA', up: true },
            { label: 'Spending', value: '$3,200', color: '#F87171', up: false },
            { label: 'Investments', value: '$27,250', color: '#6366F1', up: true },
          ].map(({ label, value, color, up }) => (
            <div key={label} className="bg-[#0A0C10]/60 rounded-xl p-3 border border-white/5">
              <div className="text-[#94A3B8] text-[10px] font-medium mb-1.5 uppercase tracking-wide">{label}</div>
              <div className="font-['Sora'] font-semibold text-sm" style={{ color }}>{value}</div>
              <div className="flex items-center gap-0.5 mt-1">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d={up ? 'M2 7L5 3L8 7' : 'M2 3L5 7L8 3'}
                    stroke={color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.7"
                  />
                </svg>
                <span className="text-[10px]" style={{ color, opacity: 0.7 }}>{up ? '+4.2%' : '-1.1%'}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#0A0C10]/40 rounded-xl overflow-hidden mb-4 border border-white/5">
          <Sparkline />
        </div>

        <div className="space-y-0">
          <div className="text-[#94A3B8] text-[10px] font-medium uppercase tracking-widest mb-2">AI Activity</div>
          {activityItems.map(({ icon, text, time }, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{icon}</span>
                <span className={`text-[#94A3B8] ${large ? 'text-sm' : 'text-xs'}`}>{text}</span>
              </div>
              <span className="text-[#64748B] text-[10px] whitespace-nowrap ml-2">{time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
