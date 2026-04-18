import { useQuery } from '@tanstack/react-query';
import { mockAuditLog } from '../mock/auditLog';

const fetchAuditLog = async () => {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return mockAuditLog;
};

export function useAudit() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['auditLog'],
    queryFn: fetchAuditLog,
    staleTime: 30000,
  });

  return {
    auditLog: data || [],
    isLoading,
    isError,
    refetch,
  };
}
