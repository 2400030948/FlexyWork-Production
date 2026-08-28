import { Gig, ShiftApplication, UserRole } from '../types';
import { apiCall } from './api';

export async function getGigs(filters?: {
  search?: string;
  category?: string;
  minPay?: number;
}): Promise<Gig[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.minPay !== undefined) params.set('minPay', String(filters.minPay));

  const data = await apiCall<{ shifts: Gig[] }>(`/api/shifts${params.size ? `?${params}` : ''}`);
  return data.shifts;
}

export async function getGigById(id: string): Promise<Gig | null> {
  try {
    const data = await apiCall<{ shift: Gig }>(`/api/shifts/${id}`);
    return data.shift;
  } catch {
    return null;
  }
}

export type CreateGigInput = {
  title: string;
  description: string;
  category: string;
  requiredSkills?: string[];
  workersRequired?: number;
  date: string;
  startTime: string;
  endTime: string;
  time?: string;
  duration?: string;
  paymentType?: 'fixed' | 'hourly';
  paymentAmount: number;
  location: string;
  urgency?: 'normal' | 'urgent';
  maximumDistance?: number;
};

export async function createGig(gigData: CreateGigInput): Promise<Gig> {
  const data = await apiCall<{ shift: Gig }>('/api/shifts', {
    method: 'POST',
    body: JSON.stringify(gigData)
  });
  return data.shift;
}

export async function applyForGig(gigId: string, _workerUserId?: string): Promise<void> {
  await apiCall(`/api/shifts/${gigId}/apply`, { method: 'POST' });
}

export async function acceptGig(gigId: string, _workerUserId?: string): Promise<void> {
  await apiCall(`/api/shifts/${gigId}/accept`, { method: 'POST' });
}

export async function recordAttendance(gigId: string, action: 'check-in' | 'check-out', otp?: string): Promise<void> {
  await apiCall(`/api/attendance/${gigId}/${action}`, {
    method: 'POST',
    body: JSON.stringify({ otp })
  });
}

export async function getMyGigs(_userId?: string, _role?: UserRole): Promise<Gig[]> {
  const data = await apiCall<{ shifts: Gig[] }>('/api/shifts/mine');
  return data.shifts;
}

export async function getShiftApplications(shiftId: string): Promise<ShiftApplication[]> {
  try {
    const data = await apiCall<{ applications: ShiftApplication[] }>(`/api/shifts/${shiftId}/applications`);
    return data.applications;
  } catch {
    return [];
  }
}

export async function updateApplicationStatus(applicationId: string, status: 'accepted' | 'rejected'): Promise<any> {
  return await apiCall(`/api/shifts/applications/${applicationId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

export async function parseAIPrompt(prompt: string): Promise<any> {
  const data = await apiCall<{ parsed: any }>('/api/shifts/parse', {
    method: 'POST',
    body: JSON.stringify({ prompt })
  });
  return data.parsed;
}

