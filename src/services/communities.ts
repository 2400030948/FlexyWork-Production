import { Community, CooperativeGig } from '../types';
import { apiCall } from './api';

export async function getCommunities(): Promise<Community[]> {
  const data = await apiCall<{ communities: Community[] }>('/api/communities');
  return data.communities;
}

export async function getCommunityById(id: string): Promise<Community | null> {
  try {
    const data = await apiCall<{ community: Community }>(`/api/communities/${id}`);
    return data.community;
  } catch {
    return null;
  }
}

export async function getCoopGigs(communityId?: string): Promise<CooperativeGig[]> {
  const params = new URLSearchParams();
  if (communityId) params.set('communityId', communityId);

  const data = await apiCall<{ coopGigs: CooperativeGig[] }>(`/api/communities/gigs${params.size ? `?${params}` : ''}`);
  return data.coopGigs;
}

export async function getCoopGigById(id: string): Promise<CooperativeGig | null> {
  try {
    const data = await apiCall<{ coopGig: CooperativeGig }>(`/api/communities/gigs/${id}`);
    return data.coopGig;
  } catch {
    return null;
  }
}

export async function joinCoopGig(coopGigId: string, requestedSkill: string): Promise<CooperativeGig> {
  const data = await apiCall<{ coopGig: CooperativeGig }>(`/api/communities/gigs/${coopGigId}/join`, {
    method: 'POST',
    body: JSON.stringify({ requestedSkill })
  });
  return data.coopGig;
}
