import { WorkerProfile, AvailabilitySlot, Certification, WorkExperience, WorkerVerificationStatusResponse } from '../types';
import { apiCall } from './api';

export async function getProviders(filters?: {
  search?: string;
  category?: string;
  maxDistance?: number;
  verified?: boolean;
  minRating?: number;
}): Promise<WorkerProfile[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.minRating) params.set('minRating', String(filters.minRating));

  const data = await apiCall<{ workers: WorkerProfile[] }>(`/api/workers${params.size ? `?${params}` : ''}`);
  let workers = data.workers;

  if (filters?.maxDistance !== undefined) {
    workers = workers.filter((worker) => (worker.distance || 0) <= filters.maxDistance!);
  }
  if (filters?.verified) {
    workers = workers.filter((worker) => worker.isVerified);
  }

  return workers;
}

export async function getMyWorkerProfile(): Promise<WorkerProfile | null> {
  try {
    const data = await apiCall<{ worker: WorkerProfile }>('/api/workers/me');
    return data.worker;
  } catch {
    return null;
  }
}

export async function getProviderById(id: string): Promise<WorkerProfile | null> {
  try {
    const data = await apiCall<{ worker: WorkerProfile }>(`/api/workers/${id}`);
    return data.worker;
  } catch {
    return null;
  }
}

export async function updateAvailability(_workerId: string, availability: AvailabilitySlot[]): Promise<void> {
  await apiCall('/api/workers/me/availability', {
    method: 'PUT',
    body: JSON.stringify({ availability })
  });
}

export async function updateWorkerProfile(profile: {
  name?: string;
  phone?: string;
  bio?: string;
  hourlyRate?: number;
  location?: string;
  skills?: string[];
}): Promise<WorkerProfile> {
  const data = await apiCall<{ worker: WorkerProfile }>('/api/workers/me', {
    method: 'PUT',
    body: JSON.stringify(profile)
  });
  return data.worker;
}

// ============= CERTIFICATIONS =============

export async function getMyCertifications(): Promise<Certification[]> {
  const data = await apiCall<{ certifications: Certification[] }>('/api/workers/me/certifications');
  return data.certifications || [];
}

export async function addCertification(payload: {
  title: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  description?: string;
  documentUrl?: string;
}): Promise<Certification> {
  const data = await apiCall<{ certification: Certification }>('/api/workers/me/certifications', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return data.certification;
}

export async function updateCertification(
  certId: string,
  payload: {
    title: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    description?: string;
    documentUrl?: string;
  }
): Promise<Certification> {
  const data = await apiCall<{ certification: Certification }>(
    `/api/workers/me/certifications/${certId}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    }
  );
  return data.certification;
}

export async function deleteCertification(certId: string): Promise<void> {
  await apiCall(`/api/workers/me/certifications/${certId}`, {
    method: 'DELETE'
  });
}

// ============= EXPERIENCE =============

export async function getMyExperiences(): Promise<WorkExperience[]> {
  const data = await apiCall<{ experiences: WorkExperience[] }>('/api/workers/me/experience');
  return data.experiences || [];
}

export async function addExperience(payload: {
  jobTitle: string;
  organization: string;
  startDate: string;
  endDate?: string;
  currentlyWorking?: boolean;
  description?: string;
  skills?: string[];
}): Promise<WorkExperience> {
  const data = await apiCall<{ experience: WorkExperience }>('/api/workers/me/experience', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return data.experience;
}

export async function updateExperience(
  expId: string,
  payload: {
    jobTitle: string;
    organization: string;
    startDate: string;
    endDate?: string;
    currentlyWorking?: boolean;
    description?: string;
    skills?: string[];
  }
): Promise<WorkExperience> {
  const data = await apiCall<{ experience: WorkExperience }>(
    `/api/workers/me/experience/${expId}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    }
  );
  return data.experience;
}

export async function deleteExperience(expId: string): Promise<void> {
  await apiCall(`/api/workers/me/experience/${expId}`, {
    method: 'DELETE'
  });
}

// ============= WORKER VERIFICATION STATUS =============

/**
 * Returns the worker's overall certificate-driven verification status.
 * This powers the trust barrier UI (unverified / pending / approved / rejected).
 */
export async function getMyVerificationStatus(): Promise<WorkerVerificationStatusResponse | null> {
  try {
    const data = await apiCall<WorkerVerificationStatusResponse>('/api/workers/me/verification-status');
    return data;
  } catch {
    return null;
  }
}
