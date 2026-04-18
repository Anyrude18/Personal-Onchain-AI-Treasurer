import { useQuery } from '@tanstack/react-query';
import { mockBudget } from '../mock/budget';
import useAppStore from '../store/useAppStore';

const fetchBudget = async () => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return mockBudget;
};

export function useBudget() {
  const { budgetCategories, updateBudgetLimit } = useAppStore();

  const { data, isLoading } = useQuery({
    queryKey: ['budget'],
    queryFn: fetchBudget,
    staleTime: 60000,
  });

  return {
    budget: data || null,
    categories: budgetCategories,
    isLoading,
    updateBudgetLimit,
  };
}
