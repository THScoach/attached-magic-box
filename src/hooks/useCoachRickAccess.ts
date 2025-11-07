import { useWhopMembership } from "./useWhopMembership";

export function useCoachRickAccess() {
  const { membership, loading } = useWhopMembership();

  const hasAccess = !loading && membership && 
    ['challenge', 'diy', 'elite'].includes(membership.tier);

  return { hasAccess, loading };
}
