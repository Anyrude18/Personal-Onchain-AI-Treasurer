import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { useBudget } from '../hooks/useBudget';

const categoryColors = ['#7c6ff7', '#f5a623', '#00c896'];

function BudgetBar({ name, spent, limit, color }) {
  const pct = Math.min((spent / limit) * 100, 100);
  const isWarning = pct >= 80;
  const isDanger = pct >= 95;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">{name}</span>
        <span className={isDanger ? 'text-[#e05252]' : isWarning ? 'text-[#f5a623]' : 'text-slate-400'}>
          ${spent} / ${limit}
        </span>
      </div>
      <div className="w-full bg-[#22263a] rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: isDanger ? '#e05252' : isWarning ? '#f5a623' : color,
          }}
        />
      </div>
      <div className="text-xs text-slate-600">{pct.toFixed(0)}% used</div>
    </div>
  );
}

export default function BudgetTracker() {
  const { budget, categories, isLoading } = useBudget();

  const chartData = budget?.monthlyHistory || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[#1a1d27] border border-white/[0.07] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <PieChartIcon size={16} className="text-[#7c6ff7]" />
            <h2 className="text-white font-semibold text-sm">Weekly Budget</h2>
          </div>
          <div className="space-y-5">
            {categories.map((cat, i) => (
              <BudgetBar
                key={cat.name}
                name={cat.name}
                spent={cat.spent}
                limit={cat.weeklyLimit}
                color={categoryColors[i % categoryColors.length]}
              />
            ))}
          </div>
        </div>

        <div className="bg-[#1a1d27] border border-white/[0.07] rounded-xl p-5">
          <h2 className="text-white font-semibold text-sm mb-5">Monthly History</h2>
          {isLoading ? (
            <div className="h-48 shimmer-bg rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#22263a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="farming" fill="#7c6ff7" radius={[3, 3, 0, 0]} name="Yield Farming" />
                <Bar dataKey="subscriptions" fill="#f5a623" radius={[3, 3, 0, 0]} name="Subscriptions" />
                <Bar dataKey="spend" fill="#00c896" radius={[3, 3, 0, 0]} name="Daily Spend" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </motion.div>
  );
}
