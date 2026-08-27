import { db } from '../mock/data';
import { WorkerProfile, AvailabilitySlot } from '../types';
import { delay } from './api';

export async function getProviders(filters?: {
  search?: string;
  category?: string;
  maxDistance?: number;
  verified?: boolean;
  minRating?: number;
}): Promise<WorkerProfile[]> {
  await delay(500);
  let workers = db.getWorkers();

  if (filters) {
    const { search, category, maxDistance, verified, minRating } = filters;

    if (search) {
      const q = search.toLowerCase();
      workers = workers.filter(
        w =>
          w.name.toLowerCase().includes(q) ||
          w.bio.toLowerCase().includes(q) ||
          w.skills.some(s => s.toLowerCase().includes(q))
      );
    }

    if (category) {
      // Map category to skill keywords
      const cat = category.toLowerCase();
      workers = workers.filter(w => {
        if (cat === 'cleaning') return w.skills.some(s => s.toLowerCase().includes('clean'));
        if (cat === 'repairs') return w.skills.some(s => s.toLowerCase().includes('repair') || s.toLowerCase().includes('wire') || s.toLowerCase().includes('install'));
        if (cat === 'gardening') return w.skills.some(s => s.toLowerCase().includes('garden') || s.toLowerCase().includes('mow') || s.toLowerCase().includes('prun'));
        return w.skills.some(s => s.toLowerCase().includes(cat));
      });
    }

    if (maxDistance !== undefined) {
      workers = workers.filter(w => (w.distance || 0) <= maxDistance);
    }

    if (verified) {
      workers = workers.filter(w => w.isVerified);
    }

    if (minRating !== undefined) {
      workers = workers.filter(w => w.rating >= minRating);
    }
  }

  return workers;
}

export async function getProviderById(id: string): Promise<WorkerProfile | null> {
  await delay(300);
  const workers = db.getWorkers();
  const worker = workers.find(w => w.id === id || w.userId === id);
  return worker || null;
}

export async function updateAvailability(workerId: string, availability: AvailabilitySlot[]): Promise<void> {
  await delay(400);
  const workers = db.getWorkers();
  const index = workers.findIndex(w => w.id === workerId || w.userId === workerId);
  if (index !== -1) {
    workers[index].availability = availability;
    db.updateWorkers(workers);
  } else {
    throw new Error('Worker profile not found.');
  }
}
