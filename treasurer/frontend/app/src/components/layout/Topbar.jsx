import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import { Bell, Menu, AlertTriangle, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import useAppStore from '../../store/useAppStore';

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/ai-chat': 'AI Chat',
  '/strategy': 'Strategy Manager',
  '/subscriptions': 'Subscriptions',
  '/budget': 'Budget Tracker',
  '/audit': 'Audit Log',
};

const HEDERA_TESTNET_ID = 296;

export default function TopBar({ onMenuClick }) {
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { notifications, setWalletAddress, markAllNotificationsRead, markNotificationRead } = useAppStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const title = routeTitles[location.pathname] || 'Dashboard';
  const unreadCount = notifications.filter((n) => !n.read).length;
  const isWrongNetwork = isConnected && chainId !== HEDERA_TESTNET_ID;

  useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
      toast.success(`Connected: ${address.slice(0, 6)}...${address.slice(-4)}`);
    } else if (!isConnected) {
      setWalletAddress(null);
    }
  }, [isConnected, address, setWalletAddress]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="fixed top-0 right-0 left-0 lg:left-60 z-20 bg-[#0f1117]/80 backdrop-blur-xl border-b border-white/[0.07]">
      {isWrongNetwork && (
        <div className="bg-[#f5a623]/10 border-b border-[#f5a623]/20 px-4 py-2 flex items-center justify-center gap-2">
          <AlertTriangle size={14} className="text-[#f5a623]" />
          <span className="text-[#f5a623] text-xs font-medium">
            Switch to Hedera Testnet to use all features
          </span>
        </div>
      )}

      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-white font-semibold text-base">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f5a623]/10 border border-[#f5a623]/20 text-[#f5a623] text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623] animate-pulse" />
            Hedera Testnet
          </span>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-colors"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#e05252] rounded-full" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-11 w-80 bg-[#1a1d27] border border-white/[0.07] rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
                  <span className="text-white text-sm font-medium">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[#7c6ff7] text-xs hover:text-[#9d94f8] transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-slate-500 text-sm">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${!n.read ? 'bg-[#7c6ff7]/5' : ''}`}
                        onClick={() => markNotificationRead(n.id)}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'success' ? 'bg-[#00c896]' : n.type === 'error' ? 'bg-[#e05252]' : 'bg-[#f5a623]'}`} />
                        <div>
                          <div className="text-slate-200 text-xs font-medium">{n.title}</div>
                          <div className="text-slate-500 text-xs mt-0.5">{n.message}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain;
              return (
                <div {...(!ready && { 'aria-hidden': true, style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' } })}>
                  {!connected ? (
                    <button
                      onClick={openConnectModal}
                      className="px-4 py-2 rounded-lg bg-[#7c6ff7] hover:bg-[#6b5fe6] text-white text-sm font-medium transition-colors"
                    >
                      Connect Wallet
                    </button>
                  ) : chain.unsupported ? (
                    <button
                      onClick={openChainModal}
                      className="px-4 py-2 rounded-lg bg-[#e05252]/20 border border-[#e05252]/30 text-[#e05252] text-sm font-medium hover:bg-[#e05252]/30 transition-colors"
                    >
                      Wrong network
                    </button>
                  ) : (
                    <button
                      onClick={openAccountModal}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#22263a] border border-white/[0.07] hover:border-white/[0.15] transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-[#00c896]" />
                      <span className="text-slate-200 text-xs font-medium">
                        {account.displayName}
                      </span>
                    </button>
                  )}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </div>
  );
}
