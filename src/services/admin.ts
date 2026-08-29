import { Community, Gig, User, WorkerProfile, Certification, WorkerVerificationStatus } from '../types';
import { apiCall } from './api';
import { getCommunities } from './communities';

export interface AdminCertificateRow {
  workerId: string;
  workerName: string;
  workerEmail: string;
  certification: Certification;
}

export interface AdminWorkerVerificationRow {
  workerId: string;
  userId: string;
  name: string;
  email: string;
  location: string;
  skills: string[];
  avatarUrl?: string;
  workerVerificationStatus: WorkerVerificationStatus;
  isVerified: boolean;
  certificates: Certification[];
  submittedAt?: string | null;
  latestCertificate?: Certification | null;
}

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

export async function getAllCertifications(): Promise<AdminCertificateRow[]> {
  const data = await apiCall<{ certifications: AdminCertificateRow[] }>('/api/admin/certifications');
  return data.certifications || [];
}

export async function setCertificateVerification(
  workerId: string,
  certId: string,
  payload: { verificationStatus: 'verified' | 'rejected'; rejectionReason?: string }
): Promise<Certification> {
  const data = await apiCall<{ certification: Certification }>(
    `/api/admin/workers/${workerId}/certifications/${certId}/verification`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }
  );
  return data.certification;
}

export async function getWorkerVerifications(): Promise<AdminWorkerVerificationRow[]> {
  const data = await apiCall<{ verifications: AdminWorkerVerificationRow[] }>('/api/admin/worker-verifications');
  return data.verifications || [];
}
