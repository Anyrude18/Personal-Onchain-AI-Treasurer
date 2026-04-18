import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const trendConfig = {
  positive: {
    icon: TrendingUp,
    classes: 'text-[#00c896] bg-[#00c896]/10',
  },
  negative: {
    icon: TrendingDown,
    classes: 'text-[#e05252] bg-[#e05252]/10',
  },
  neutral: {
    icon: Minus,
    classes: 'text-slate-400 bg-white/5',
  },
};

/**
 * @param {{ title: string, value: string, subtitle?: string, icon: React.ReactNode, trend?: 'positive'|'negative'|'neutral', trendValue?: string, onClick?: () => void, action?: React.ReactNode }} props
 */
export default function StatCard({ title, value, subtitle, icon, trend, trendValue, onClick, action }) {
  const TrendIcon = trend ? trendConfig[trend].icon : null;

  return (
    <div
      className={`bg-[#1a1d27] border border-white/[0.07] rounded-xl p-5 flex flex-col gap-3 transition-all duration-150 ${onClick ? 'cursor-pointer hover:border-white/[0.15] hover:bg-[#1e2233]' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        <div className="w-9 h-9 rounded-lg bg-[#7c6ff7]/10 flex items-center justify-center text-[#7c6ff7]">
          {icon}
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-semibold text-white tracking-tight">{value}</div>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2">
            {trend && TrendIcon && trendValue && (
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${trendConfig[trend].classes}`}>
                <TrendIcon size={11} />
                {trendValue}
              </span>
            )}
            {subtitle && (
              <span className="text-slate-500 text-xs">{subtitle}</span>
            )}
          </div>
        )}
      </div>

      {action && (
        <div className="mt-1">
          {action}
        </div>
      )}
    </div>
  );
}
