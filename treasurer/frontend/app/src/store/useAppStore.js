import { create } from 'zustand';
import { mockSubscriptions } from '../mock/subscriptions';

const useAppStore = create((set) => ({
  walletAddress: null,
  isAgentActive: false,
  riskTolerance: 'balanced',
  agentMode: 'suggest',
  chatMessages: [],
  budgetCategories: [
    { name: 'Yield Farming', weeklyLimit: 500, spent: 340 },
    { name: 'Subscriptions', weeklyLimit: 100, spent: 94 },
    { name: 'Daily Spend', weeklyLimit: 200, spent: 178 },
  ],
  notifications: [],
  subscriptions: mockSubscriptions,
  strategySettings: {
    autoCompound: true,
    autoRebalance: true,
    rebalanceThreshold: 2,
    enableLP: false,
    enableLeverage: false,
    maxGasPerTx: 0.01,
    maxTxSize: 1000,
    rebalanceFrequency: 'daily',
    slippage: 0.5,
    whitelistedProtocols: ['SaucerSwap V2', 'HBAR Native Staking', 'Heliswap'],
  },

  setWalletAddress: (address) => set({ walletAddress: address }),

  toggleAgent: () => set((state) => ({ isAgentActive: !state.isAgentActive })),

  setRiskTolerance: (level) => set({ riskTolerance: level }),

  setAgentMode: (mode) => set({ agentMode: mode }),

  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, { ...message, id: Date.now() }],
    })),

  updateBudget: (categories) => set({ budgetCategories: categories }),

  updateBudgetLimit: (name, weeklyLimit) =>
    set((state) => ({
      budgetCategories: state.budgetCategories.map((cat) =>
        cat.name === name ? { ...cat, weeklyLimit } : cat
      ),
    })),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        { ...notification, id: Date.now(), read: false },
        ...state.notifications,
      ],
    })),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  updateStrategySettings: (settings) =>
    set((state) => ({
      strategySettings: { ...state.strategySettings, ...settings },
    })),

  addSubscription: (subscription) =>
    set((state) => ({
      subscriptions: [...state.subscriptions, { ...subscription, id: Date.now() }],
    })),

  updateSubscription: (id, updates) =>
    set((state) => ({
      subscriptions: state.subscriptions.map((sub) =>
        sub.id === id ? { ...sub, ...updates } : sub
      ),
    })),
}));

export default useAppStore;
