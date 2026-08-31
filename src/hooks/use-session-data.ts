import { useQuery } from '@tanstack/react-query';
import { SessionResponse, SessionRole } from '@/types/session.types';
import { fetchSessionDichotomy } from '@/lib/session-data';

export function useSessionData(
  role: SessionRole = 'admin',
  profileId: string | null = null,
  eleveId: string | null = null
) {
  return useQuery<SessionResponse>({
    queryKey: ['session-dichotomy', role, profileId, eleveId],
    queryFn: () => fetchSessionDichotomy(role, profileId, eleveId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
