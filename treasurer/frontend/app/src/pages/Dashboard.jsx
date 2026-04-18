import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  DollarSign,
  Gift,
  Layers,
  Zap,
  Sparkles,
  Copy,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Wallet,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAccount } from 'wagmi';

import { usePortfolio } from '../hooks/usePortfolio';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import TokenIcon from '../components/ui/TokenIcon';
import { SkeletonStatCard, SkeletonChart, SkeletonTable } from '../components/ui/SkeletonLoader';

const PIE_COLORS = ['#7c6ff7', '#00c896', '#f5a623', '#e05252'];

const statusVariant = {
  Completed: 'success',
  Pending: 'warning',
  Failed: 'danger',
};

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    toast.success('Tx hash copied!');
  });
}

function truncateHash(hash) {
  if (!hash) return '';
  return hash.slice(0, 8) + '...' + hash.slice(-6);
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-[#22263a] border border-white/[0.10] rounded-lg px-3 py-2 shadow-xl">
      <div className="text-white text-sm font-medium">{item.protocol}</div>
      <div className="text-slate-300 text-xs mt-0.5">${item.value.toLocaleString()}</div>
      {item.apy > 0 && (
        <div className="text-[#00c896] text-xs mt-0.5">APY: {item.apy}%</div>
      )}
    </div>
  );
}

function PortfolioPieChart({ positions, totalValue }) {
  const data = positions.map((p) => ({
    ...p,
    name: p.token,
    protocol: p.protocol,
  }));

  return (
    <div className="bg-[#1a1d27] border border-white/[0.07] rounded-xl p-5 h-full flex flex-col">
      <h2 className="text-white font-semibold text-sm mb-4">Portfolio Allocation</h2>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="-mt-2 text-center pointer-events-none">
          <div
            className="text-white text-xl font-bold"
            style={{ marginTop: '-140px', position: 'relative', zIndex: 10 }}
          />
        </div>
      </div>

      <div className="space-y-2 mt-2">
        {positions.map((position, index) => (
          <div key={position.protocol} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
            <div className="flex items-center gap-2.5">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
              />
              <TokenIcon symbol={position.token} size="sm" />
              <div>
                <div className="text-slate-200 text-xs font-medium">{position.protocol}</div>
                <div className="text-slate-500 text-xs">{position.token}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-200 text-xs font-medium">
                ${position.value.toLocaleString()}
              </span>
              {position.apy > 0 && (
                <Badge label={`${position.apy}%`} variant="success" size="sm" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AISuggestionsPanel({ recommendations }) {
  const navigate = useNavigate();

  const handleApply = (rec) => {
    toast.success(`Applying: ${rec.title}`);
  };

  const handleExplain = () => {
    navigate('/ai-chat');
  };

  return (
    <div className="bg-[#1a1d27] border border-white/[0.07] rounded-xl p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-[#7c6ff7]" />
        <h2 className="text-white font-semibold text-sm">AI Suggestions</h2>
      </div>

      <div className="space-y-3 flex-1">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-[#22263a] border border-white/[0.05] rounded-lg p-3.5 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-white text-sm font-medium leading-tight">{rec.title}</span>
              <Badge label={rec.gain} variant="success" size="sm" />
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">{rec.reasoning}</p>
            <div className="flex gap-2 pt-0.5">
              <button
                onClick={() => handleApply(rec)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#7c6ff7] hover:bg-[#6b5fe6] text-white text-xs font-medium transition-colors"
              >
                Apply
              </button>
              <button
                onClick={handleExplain}
                className="flex-1 px-3 py-1.5 rounded-lg border border-white/[0.12] text-slate-300 text-xs font-medium hover:bg-white/[0.05] hover:text-white transition-colors"
              >
                Explain
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityTable({ activities, onViewAll }) {
  return (
    <div className="bg-[#1a1d27] border border-white/[0.07] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
        <h2 className="text-white font-semibold text-sm">Recent Activity</h2>
        <button
          onClick={onViewAll}
          className="text-[#7c6ff7] text-xs hover:text-[#9d94f8] transition-colors flex items-center gap-1"
        >
          View All
          <ExternalLink size={11} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-white/[0.05]">
              {['Time', 'Action', 'Protocol', 'Amount', 'Status', 'Tx Hash'].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {activities.map((activity, i) => (
              <tr
                key={i}
                className="hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                  {activity.time}
                </td>
                <td className="px-5 py-3.5 text-slate-200 text-xs font-medium whitespace-nowrap">
                  {activity.action}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <TokenIcon symbol={activity.protocol.split(' ')[0]} size="sm" />
                    <span className="text-slate-300 text-xs">{activity.protocol}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-200 text-xs font-medium whitespace-nowrap">
                  <span
                    className={
                      activity.amount.startsWith('+')
                        ? 'text-[#00c896]'
                        : activity.amount.startsWith('-')
                        ? 'text-[#e05252]'
                        : 'text-slate-200'
                    }
                  >
                    {activity.amount}
                  </span>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <Badge
                    label={activity.status}
                    variant={statusVariant[activity.status] || 'default'}
                    size="sm"
                  />
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs font-mono">
                      {truncateHash(activity.txHash)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(activity.txHash)}
                      className="text-slate-600 hover:text-slate-300 transition-colors"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { portfolio, isLoading, isError, refetch } = usePortfolio();
  const { isConnected } = useAccount();
  const navigate = useNavigate();

  const handleHarvestAll = () => {
    toast.success('Harvesting all rewards — $84.20 will be compounded');
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <AlertCircle size={40} className="text-[#e05252]" />
        <div className="text-slate-400 text-sm">Failed to load portfolio data</div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7c6ff7] text-white text-sm hover:bg-[#6b5fe6] transition-colors"
        >
          <RefreshCw size={14} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {!isConnected && (
        <div className="flex items-center gap-3 px-4 py-3 bg-[#7c6ff7]/8 border border-[#7c6ff7]/20 rounded-xl">
          <Wallet size={16} className="text-[#7c6ff7] flex-shrink-0" />
          <span className="text-slate-300 text-sm">
            Connect your wallet for live on-chain data and AI-powered recommendations.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : (
          <>
            <StatCard
              title="Total Portfolio Value"
              value={`$${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              icon={<DollarSign size={16} />}
              trend="positive"
              trendValue={`+${portfolio.change24h}%`}
              subtitle="24h change"
            />
            <StatCard
              title="Pending Rewards"
              value={`$${portfolio.pendingRewards.toFixed(2)}`}
              icon={<Gift size={16} />}
              trend="positive"
              trendValue="Ready"
              action={
                <button
                  onClick={handleHarvestAll}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#00c896]/15 border border-[#00c896]/25 text-[#00c896] text-xs font-medium hover:bg-[#00c896]/25 transition-colors"
                >
                  Harvest All
                </button>
              }
            />
            <StatCard
              title="Active Positions"
              value={`${portfolio.positions.length} protocols`}
              icon={<Layers size={16} />}
              trend="neutral"
              subtitle="Across all positions"
            />
            <StatCard
              title="Gas Used Today"
              value={`${portfolio.gasSpentToday} HBAR`}
              icon={<Zap size={16} />}
              trend="neutral"
              subtitle="Network fees"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          {isLoading ? (
            <SkeletonChart />
          ) : (
            <PortfolioPieChart
              positions={portfolio.positions}
              totalValue={portfolio.totalValue}
            />
          )}
        </div>
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="bg-[#1a1d27] border border-white/[0.07] rounded-xl p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#22263a] rounded-lg p-3 space-y-2 animate-pulse">
                  <div className="h-4 w-3/4 bg-white/5 rounded" />
                  <div className="h-3 w-full bg-white/5 rounded" />
                  <div className="h-3 w-5/6 bg-white/5 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <AISuggestionsPanel recommendations={portfolio.recommendations} />
          )}
        </div>
      </div>

      <div>
        {isLoading ? (
          <SkeletonTable />
        ) : (
          <ActivityTable
            activities={portfolio.recentActivity}
            onViewAll={() => navigate('/audit')}
          />
        )}
      </div>
    </motion.div>
  );
}
