export const mockBudget = {
  categories: [
    { name: "Yield Farming", weeklyLimit: 500, spent: 340, color: "#7c6ff7" },
    { name: "Subscriptions", weeklyLimit: 100, spent: 94, color: "#f5a623" },
    { name: "Daily Spend", weeklyLimit: 200, spent: 178, color: "#00c896" }
  ],
  weeklyTotal: 800,
  weeklySpent: 612,
  monthlyHistory: [
    { week: "Week 1", farming: 280, subscriptions: 80, spend: 150 },
    { week: "Week 2", farming: 340, subscriptions: 94, spend: 178 },
    { week: "Week 3", farming: 310, subscriptions: 85, spend: 165 },
    { week: "Week 4", farming: 420, subscriptions: 94, spend: 190 }
  ]
};
