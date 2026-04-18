import { motion } from 'framer-motion';
import { RefreshCw, Pause, Play, Plus, Calendar, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../components/ui/Badge';
import useAppStore from '../store/useAppStore';

export default function Subscriptions() {
  const { subscriptions, updateSubscription } = useAppStore();

  const handleToggle = (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    updateSubscription(id, { status: newStatus });
    toast.success(`Subscription ${newStatus}`);
  };

  const totalMonthly = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1a1d27] border border-white/[0.07] rounded-xl p-4">
          <div className="text-slate-400 text-xs mb-1">Monthly Total</div>
          <div className="text-white text-xl font-semibold">${totalMonthly.toFixed(2)}</div>
        </div>
        <div className="bg-[#1a1d27] border border-white/[0.07] rounded-xl p-4">
          <div className="text-slate-400 text-xs mb-1">Active</div>
          <div className="text-white text-xl font-semibold">
            {subscriptions.filter((s) => s.status === 'active').length}
          </div>
        </div>
        <div className="bg-[#1a1d27] border border-white/[0.07] rounded-xl p-4">
          <div className="text-slate-400 text-xs mb-1">Paused</div>
          <div className="text-white text-xl font-semibold">
            {subscriptions.filter((s) => s.status === 'paused').length}
          </div>
        </div>
      </div>

      <div className="bg-[#1a1d27] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <h2 className="text-white font-semibold text-sm">Active Subscriptions</h2>
          <button
            onClick={() => toast('Coming soon: Add subscription')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7c6ff7]/15 text-[#7c6ff7] text-xs font-medium hover:bg-[#7c6ff7]/25 transition-colors"
          >
            <Plus size={13} />
            Add
          </button>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#22263a] flex items-center justify-center">
                  <RefreshCw size={15} className="text-[#7c6ff7]" />
                </div>
                <div>
                  <div className="text-slate-200 text-sm font-medium">{sub.name}</div>
                  <div className="text-slate-500 text-xs">{sub.description}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <div className="text-white text-sm font-medium">${sub.amount}/mo</div>
                  <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                    <Calendar size={11} />
                    {sub.nextBilling}
                  </div>
                </div>
                <Badge
                  label={sub.status}
                  variant={sub.status === 'active' ? 'success' : 'default'}
                  size="sm"
                />
                <button
                  onClick={() => handleToggle(sub.id, sub.status)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    sub.status === 'active'
                      ? 'bg-[#f5a623]/10 text-[#f5a623] hover:bg-[#f5a623]/20'
                      : 'bg-[#00c896]/10 text-[#00c896] hover:bg-[#00c896]/20'
                  }`}
                >
                  {sub.status === 'active' ? <Pause size={13} /> : <Play size={13} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
