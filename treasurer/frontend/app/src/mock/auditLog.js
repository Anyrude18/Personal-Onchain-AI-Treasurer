export const mockAuditLog = [
  {
    id: 1,
    timestamp: "2024-01-18 14:32:05",
    action: "Auto-compound",
    protocol: "SaucerSwap LP",
    amount: "+$12.40",
    status: "Completed",
    initiatedBy: "AI Agent",
    txHash: "0xabc123def456789012345678901234567890abcd",
    gasUsed: 0.0004
  },
  {
    id: 2,
    timestamp: "2024-01-18 11:15:22",
    action: "Rebalance",
    protocol: "Lending Pool",
    amount: "$500.00",
    status: "Completed",
    initiatedBy: "AI Agent",
    txHash: "0xdef456ghi789012345678901234567890abcdef01",
    gasUsed: 0.0008
  },
  {
    id: 3,
    timestamp: "2024-01-18 08:01:44",
    action: "Harvest",
    protocol: "HBAR Staking",
    amount: "+$8.20",
    status: "Pending",
    initiatedBy: "AI Agent",
    txHash: "0xghi789jkl012345678901234567890abcdef0123",
    gasUsed: 0.0003
  },
  {
    id: 4,
    timestamp: "2024-01-17 16:45:12",
    action: "Subscription",
    protocol: "Wallet",
    amount: "-$29.99",
    status: "Completed",
    initiatedBy: "User",
    txHash: "0xjkl012mno345678901234567890abcdef012345",
    gasUsed: 0.0002
  },
  {
    id: 5,
    timestamp: "2024-01-16 09:22:38",
    action: "Swap",
    protocol: "SaucerSwap LP",
    amount: "$200.00",
    status: "Failed",
    initiatedBy: "AI Agent",
    txHash: "0xmno345pqr678901234567890abcdef01234567",
    gasUsed: 0.0001
  }
];
