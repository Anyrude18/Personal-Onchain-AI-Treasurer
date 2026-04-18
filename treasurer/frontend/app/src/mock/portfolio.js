export const mockPortfolio = {
  totalValue: 12840.50,
  change24h: +3.2,
  positions: [
    { protocol: "SaucerSwap LP", token: "HBAR/USDC", value: 4200, apy: 8.4, type: "lp" },
    { protocol: "Lending Pool", token: "USDC", value: 3100, apy: 5.1, type: "lending" },
    { protocol: "HBAR Staking", token: "HBAR", value: 3540, apy: 6.2, type: "staking" },
    { protocol: "Wallet", token: "USDC", value: 2000, apy: 0, type: "wallet" }
  ],
  pendingRewards: 84.20,
  gasSpentToday: 0.002,
  recentActivity: [
    { time: "2h ago", action: "Auto-compound", protocol: "SaucerSwap LP", amount: "+$12.40", status: "Completed", txHash: "0xabc123def456789012345678901234567890abcd" },
    { time: "5h ago", action: "Rebalance", protocol: "Lending Pool", amount: "$500", status: "Completed", txHash: "0xdef456ghi789012345678901234567890abcdef01" },
    { time: "8h ago", action: "Harvest", protocol: "HBAR Staking", amount: "+$8.20", status: "Pending", txHash: "0xghi789jkl012345678901234567890abcdef0123" },
    { time: "1d ago", action: "Subscription", protocol: "Wallet", amount: "-$29.99", status: "Completed", txHash: "0xjkl012mno345678901234567890abcdef012345" },
    { time: "2d ago", action: "Swap", protocol: "SaucerSwap LP", amount: "$200", status: "Failed", txHash: "0xmno345pqr678901234567890abcdef01234567" }
  ]
};

export const mockRecommendations = [
  {
    id: 1,
    title: "Rebalance to higher yield",
    reasoning: "SaucerSwap LP is offering 8.4% APY vs your Lending Pool at 5.1%. Moving $500 could earn significantly more.",
    gain: "+$23/mo",
    action: "rebalance"
  },
  {
    id: 2,
    title: "Harvest pending rewards",
    reasoning: "You have $84.20 in unclaimed rewards. Compounding now maximizes your yield and compounds earnings.",
    gain: "+$4/mo",
    action: "harvest"
  },
  {
    id: 3,
    title: "Reduce gas spending",
    reasoning: "Your rebalance frequency is set to hourly. Switching to daily saves ~0.01 HBAR/week in gas fees.",
    gain: "+$2/mo",
    action: "optimize_gas"
  }
];
