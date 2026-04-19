import { motion } from 'framer-motion';
import { ShieldCheck, Copy, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../components/ui/Badge';
import TokenIcon from '../components/ui/TokenIcon';
import { SkeletonTable } from '../components/ui/SkeletonLoader';
import { useAudit } from '../hooks/useAudit';

const statusVariant = {
  Completed: 'success',
  Pending: 'warning',
  Failed: 'danger',
};

function truncateHash(hash) {
  if (!hash) return '';
  return hash.slice(0, 8) + '...' + hash.slice(-6);
}

export default function AuditLog() {
  const { auditLog = [], isLoading, refetch } = useAudit();

  const copyHash = (hash) => {
    if (!hash || !navigator?.clipboard?.writeText) return;
    navigator.clipboard.writeText(hash);
    toast.success('Tx hash copied!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#7c6ff7]" />
          <h2 className="text-white font-semibold text-sm">Transaction Audit Log</h2>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.10] text-slate-400 text-xs hover:text-slate-200 hover:border-white/[0.20] transition-colors"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <SkeletonTable />
      ) : (
        <div className="bg-[#1a1d27] border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {['Timestamp', 'Action', 'Protocol', 'Amount', 'Initiated By', 'Status', 'Gas Used', 'Tx Hash'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {auditLog.map((entry) => {
                  const protocolSymbol = (entry.protocol || '').split(' ')[0];
                  const amountText = String(entry.amount ?? '');
                  const amountClass = amountText.startsWith('+')
                    ? 'text-[#00c896]'
                    : amountText.startsWith('-')
                    ? 'text-[#e05252]'
                    : 'text-slate-200';

                  return (
                    <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap font-mono">
                        {entry.timestamp}
                      </td>
                      <td className="px-4 py-3.5 text-slate-200 text-xs font-medium whitespace-nowrap">
                        {entry.action}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <TokenIcon symbol={protocolSymbol} size="sm" />
                          <span className="text-slate-300 text-xs">{entry.protocol}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium whitespace-nowrap">
                        <span className={amountClass}>{amountText}</span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                        {entry.initiatedBy}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <Badge label={entry.status} variant={statusVariant[entry.status] || 'default'} size="sm" />
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                        {entry.gasUsed} HBAR
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-xs font-mono">{truncateHash(entry.txHash)}</span>
                          <button onClick={() => copyHash(entry.txHash)} className="text-slate-600 hover:text-slate-300 transition-colors">
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}