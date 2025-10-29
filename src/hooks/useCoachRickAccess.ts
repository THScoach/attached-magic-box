import { useUserMembership } from "./useUserMembership";

export function useCoachRickAccess() {
  const { membership, loading } = useUserMembership();

  const hasAccess = !loading && membership && 
    ['challenge', 'diy', 'elite'].includes(membership.tier);

  return { hasAccess, loading };
}
