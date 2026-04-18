import { useQuery } from '@tanstack/react-query';
import { mockPortfolio, mockRecommendations } from '../mock/portfolio';

const fetchPortfolio = async () => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { ...mockPortfolio, recommendations: mockRecommendations };
};

export function usePortfolio() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolio,
    refetchInterval: 30000,
    staleTime: 20000,
  });

  return {
    portfolio: data || null,
    isLoading,
    isError,
    refetch,
  };
}
