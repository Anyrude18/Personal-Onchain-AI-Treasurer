import { CheckCircle, XCircle, Fuel, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import TokenIcon from './TokenIcon';

/**
 * @param {{ action: string, fromProtocol: string, toProtocol?: string, amount: string, estimatedGas: string, estimatedGain: string, onApprove: () => void, onReject: () => void }} props
 */
export default function TransactionCard({
  action,
  fromProtocol,
  toProtocol,
  amount,
  estimatedGas,
  estimatedGain,
  onApprove,
  onReject,
}) {
  const handleApprove = () => {
    toast.success('Transaction submitted to Hedera Testnet');
    onApprove?.();
  };

  return (
    <div className="bg-[#1a1d27] border border-white/[0.07] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-white font-medium text-sm">{action}</span>
        <span className="text-xs text-slate-500">Pending Approval</span>
      </div>

      <div className="flex items-center gap-2">
        <TokenIcon symbol={fromProtocol} size="sm" />
        <div>
          <div className="text-slate-300 text-sm">{fromProtocol}</div>
          {toProtocol && (
            <div className="text-slate-500 text-xs">→ {toProtocol}</div>
          )}
        </div>
        <div className="ml-auto text-right">
          <div className="text-white font-semibold text-sm">{amount}</div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1 text-slate-400">
          <Fuel size={12} />
          <span>{estimatedGas}</span>
        </div>
        <div className="flex items-center gap-1 text-[#00c896]">
          <TrendingUp size={12} />
          <span>{estimatedGain}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={onReject}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.12] text-slate-400 text-xs font-medium hover:bg-white/5 hover:text-slate-200 transition-colors"
        >
          <XCircle size={14} />
          Reject
        </button>
        <button
          onClick={handleApprove}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#7c6ff7] text-white text-xs font-medium hover:bg-[#6b5fe6] transition-colors"
        >
          <CheckCircle size={14} />
          Approve
        </button>
      </div>
    </div>
  );
}
