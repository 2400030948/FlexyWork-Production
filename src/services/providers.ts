import { WorkerProfile, AvailabilitySlot } from '../types';
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
