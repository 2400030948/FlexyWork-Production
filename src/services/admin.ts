import { Community, Gig, User, WorkerProfile } from '../types';
import { apiCall } from './api';
import { getCommunities } from './communities';

export async function getAdminDashboard(): Promise<{
  users: User[];
  workers: WorkerProfile[];
  gigs: Gig[];
  communities: Community[];
}> {
  const [dashboard, communities] = await Promise.all([
    apiCall<{ users: User[]; workers: WorkerProfile[]; shifts: Gig[] }>('/api/admin/dashboard'),
    getCommunities()
  ]);

  return {
    users: dashboard.users,
    workers: dashboard.workers,
    gigs: dashboard.shifts,
    communities
  };
}

export async function toggleWorkerVerification(workerId: string): Promise<WorkerProfile> {
  const data = await apiCall<{ worker: WorkerProfile }>(`/api/admin/workers/${workerId}/verification`, {
    method: 'PATCH'
  });
  return data.worker;
}
