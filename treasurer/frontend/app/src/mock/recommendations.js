export const mockRecommendations = [
  {
    id: 1,
    title: "Rebalance to higher yield",
    reasoning: "SaucerSwap LP is offering 8.4% APY vs your Lending Pool at 5.1%. Moving $500 could earn significantly more.",
    gain: "+$23/mo",
    action: "rebalance",
    risk: "low",
    estimatedGas: "0.0008 HBAR"
  },
  {
    id: 2,
    title: "Harvest pending rewards",
    reasoning: "You have $84.20 in unclaimed rewards. Compounding now maximizes your yield and compounds earnings.",
    gain: "+$4/mo",
    action: "harvest",
    risk: "minimal",
    estimatedGas: "0.0003 HBAR"
  },
  {
    id: 3,
    title: "Reduce gas spending",
    reasoning: "Your rebalance frequency is set to hourly. Switching to daily saves ~0.01 HBAR/week in gas fees.",
    gain: "+$2/mo",
    action: "optimize_gas",
    risk: "none",
    estimatedGas: "0 HBAR"
  }
];
