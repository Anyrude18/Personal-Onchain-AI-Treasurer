import { motion } from 'framer-motion';
import { Settings2, ToggleLeft, ToggleRight, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import useAppStore from '../store/useAppStore';

function Toggle({ enabled, onToggle, label, description }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-white/[0.05] last:border-0">
      <div>
        <div className="text-slate-200 text-sm font-medium">{label}</div>
        {description && <div className="text-slate-500 text-xs mt-0.5">{description}</div>}
      </div>
      <button
        onClick={onToggle}
        className={`transition-colors ${enabled ? 'text-[#7c6ff7]' : 'text-slate-600'}`}
      >
        {enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
      </button>
    </div>
  );
}

export default function StrategyManager() {
  const { strategySettings, updateStrategySettings } = useAppStore();

  const toggle = (key) => {
    updateStrategySettings({ [key]: !strategySettings[key] });
    toast.success(`${key} ${!strategySettings[key] ? 'enabled' : 'disabled'}`);
  };

  const handleSliderChange = (key, value) => {
    updateStrategySettings({ [key]: parseFloat(value) });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5 max-w-2xl"
    >
      <div className="bg-[#1a1d27] border border-white/[0.07] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 size={16} className="text-[#7c6ff7]" />
          <h2 className="text-white font-semibold text-sm">Automation Settings</h2>
        </div>
        <div>
          <Toggle
            enabled={strategySettings.autoCompound}
            onToggle={() => toggle('autoCompound')}
            label="Auto-Compound Rewards"
            description="Automatically reinvest earned rewards to maximize yield"
          />
          <Toggle
            enabled={strategySettings.autoRebalance}
            onToggle={() => toggle('autoRebalance')}
            label="Auto-Rebalance Portfolio"
            description="Rebalance when deviation exceeds threshold"
          />
          <Toggle
            enabled={strategySettings.enableLP}
            onToggle={() => toggle('enableLP')}
            label="Enable LP Positions"
            description="Allow AI to enter liquidity provider positions"
          />
          <Toggle
            enabled={strategySettings.enableLeverage}
            onToggle={() => toggle('enableLeverage')}
            label="Enable Leverage"
            description="Allow leveraged positions (higher risk)"
          />
        </div>
      </div>

      <div className="bg-[#1a1d27] border border-white/[0.07] rounded-xl p-5 space-y-5">
        <h2 className="text-white font-semibold text-sm">Risk Parameters</h2>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-slate-300 text-sm">Rebalance Threshold</label>
            <span className="text-[#7c6ff7] text-sm font-medium">{strategySettings.rebalanceThreshold}%</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            value={strategySettings.rebalanceThreshold}
            onChange={(e) => handleSliderChange('rebalanceThreshold', e.target.value)}
            className="w-full accent-[#7c6ff7]"
          />
          <div className="flex justify-between text-xs text-slate-600">
            <span>0.5%</span>
            <span>10%</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-slate-300 text-sm">Max Gas Per Transaction</label>
            <span className="text-[#7c6ff7] text-sm font-medium">{strategySettings.maxGasPerTx} HBAR</span>
          </div>
          <input
            type="range"
            min="0.001"
            max="0.1"
            step="0.001"
            value={strategySettings.maxGasPerTx}
            onChange={(e) => handleSliderChange('maxGasPerTx', e.target.value)}
            className="w-full accent-[#7c6ff7]"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-slate-300 text-sm">Slippage Tolerance</label>
            <span className="text-[#7c6ff7] text-sm font-medium">{strategySettings.slippage}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={strategySettings.slippage}
            onChange={(e) => handleSliderChange('slippage', e.target.value)}
            className="w-full accent-[#7c6ff7]"
          />
        </div>
      </div>

      <div className="bg-[#1a1d27] border border-white/[0.07] rounded-xl p-5">
        <h2 className="text-white font-semibold text-sm mb-4">Whitelisted Protocols</h2>
        <div className="space-y-2">
          {strategySettings.whitelistedProtocols.map((protocol) => (
            <div
              key={protocol}
              className="flex items-center justify-between px-3 py-2.5 bg-[#22263a] rounded-lg"
            >
              <span className="text-slate-200 text-sm">{protocol}</span>
              <span className="text-[#00c896] text-xs">Active</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-slate-500 text-xs">
          <Info size={12} />
          <span>Only whitelisted protocols will be used for automated transactions</span>
        </div>
      </div>
    </motion.div>
  );
}
