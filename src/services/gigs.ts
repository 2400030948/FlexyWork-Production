import { db } from '../mock/data';
import { Gig, GigStatus, UserRole, Transaction } from '../types';
import { delay } from './api';

export async function getGigs(filters?: {
  search?: string;
  category?: string;
  minPay?: number;
}): Promise<Gig[]> {
  await delay(400);
  let gigs = db.getGigs();

  // Return only gigs that are open/requested/published
  gigs = gigs.filter(g => g.status === 'REQUESTED' || g.status === 'ACCEPTED');

  if (filters) {
    const { search, category, minPay } = filters;
    if (search) {
      const q = search.toLowerCase();
      gigs = gigs.filter(g => 
        g.title.toLowerCase().includes(q) || 
        g.description.toLowerCase().includes(q) ||
        g.location.toLowerCase().includes(q)
      );
    }
    if (category) {
      gigs = gigs.filter(g => g.category.toLowerCase() === category.toLowerCase());
    }
    if (minPay !== undefined) {
      gigs = gigs.filter(g => g.paymentAmount >= minPay);
    }
  }

  return gigs;
}

export async function getGigById(id: string): Promise<Gig | null> {
  await delay(250);
  const gigs = db.getGigs();
  const gig = gigs.find(g => g.id === id);
  return gig || null;
}

export async function createGig(gigData: Omit<Gig, 'id' | 'filledCount' | 'assignedWorkerIds' | 'status' | 'employerName'>): Promise<Gig> {
  await delay(600);
  const gigs = db.getGigs();
  const currentUser = db.getCurrentUser();
  
  if (!currentUser) throw new Error('Not authenticated.');

  const newGig: Gig = {
    ...gigData,
    id: `gig_${Date.now()}`,
    filledCount: 0,
    assignedWorkerIds: [],
    status: 'REQUESTED',
    employerId: currentUser.id,
    employerName: currentUser.name,
    matchScore: 92,
    matchReasons: ['Location matches', 'Required skill set matches']
  };

  db.updateGigs([newGig, ...gigs]);

  // Seed notification for workers with matching skills
  const workers = db.getWorkers();
  const notifications = db.getNotifications();
  const matchingWorkers = workers.filter(w => w.skills.includes(gigData.requiredSkills[0]));
  
  const newNotifications = matchingWorkers.map(w => ({
    id: `n_${Date.now()}_${w.id}`,
    userId: w.userId,
    title: 'New gig match!',
    message: `A new ${gigData.category} gig matches your skills: ${gigData.title}`,
    timestamp: 'Just now',
    read: false,
    type: 'gig' as const
  }));

  db.updateNotifications([...newNotifications, ...notifications]);

  return newGig;
}

export async function applyForGig(gigId: string, workerUserId: string): Promise<void> {
  await delay(400);
  const gigs = db.getGigs();
  const gigIndex = gigs.findIndex(g => g.id === gigId);

  if (gigIndex === -1) throw new Error('Gig not found.');
  const gig = gigs[gigIndex];

  if (gig.applicationStatus === 'pending' || gig.applicationStatus === 'accepted') {
    throw new Error('You have already applied/accepted this gig.');
  }

  gigs[gigIndex] = {
    ...gig,
    applicationStatus: 'pending'
  };
  
  db.updateGigs(gigs);

  // Notify Seeker
  const notifications = db.getNotifications();
  const users = db.getUsers();
  const worker = users.find(u => u.id === workerUserId);
  const newNotification = {
    id: `n_${Date.now()}`,
    userId: gig.employerId,
    title: 'New applicant',
    message: `${worker?.name || 'A worker'} has applied for your gig: ${gig.title}`,
    timestamp: 'Just now',
    read: false,
    type: 'booking' as const
  };
  db.updateNotifications([newNotification, ...notifications]);
}

export async function acceptGig(gigId: string, workerUserId: string): Promise<void> {
  await delay(500);
  const gigs = db.getGigs();
  const gigIndex = gigs.findIndex(g => g.id === gigId);

  if (gigIndex === -1) throw new Error('Gig not found.');
  const gig = gigs[gigIndex];

  gigs[gigIndex] = {
    ...gig,
    status: 'ACCEPTED',
    filledCount: 1,
    assignedWorkerIds: [workerUserId],
    applicationStatus: 'accepted'
  };

  db.updateGigs(gigs);

  // Notify worker
  const notifications = db.getNotifications();
  const newNotification = {
    id: `n_${Date.now()}`,
    userId: workerUserId,
    title: 'Gig accepted!',
    message: `Your application to "${gig.title}" has been accepted. Go to your command center to start working.`,
    timestamp: 'Just now',
    read: false,
    type: 'gig' as const
  };
  db.updateNotifications([newNotification, ...notifications]);
}

export async function changeGigStatus(gigId: string, status: GigStatus): Promise<void> {
  await delay(500);
  const gigs = db.getGigs();
  const gigIndex = gigs.findIndex(g => g.id === gigId);

  if (gigIndex === -1) throw new Error('Gig not found.');
  const gig = gigs[gigIndex];

  gigs[gigIndex] = { ...gig, status };
  db.updateGigs(gigs);

  const notifications = db.getNotifications();

  if (status === 'COMPLETED') {
    // Increment completed gigs for worker
    const workerUserId = gig.assignedWorkerIds[0];
    if (workerUserId) {
      const workers = db.getWorkers();
      const wIdx = workers.findIndex(w => w.userId === workerUserId);
      if (wIdx !== -1) {
        workers[wIdx].completedGigsCount += 1;
        db.updateWorkers(workers);
      }

      // Add to transactions
      const transactions = db.getTransactions();
      const newTransaction: Transaction = {
        id: `t_${Date.now()}`,
        userId: workerUserId,
        date: new Date().toISOString().slice(0, 10),
        amount: gig.paymentAmount,
        type: 'earnings',
        description: `Earnings: ${gig.title}`,
        status: 'completed'
      };
      db.updateTransactions([newTransaction, ...transactions]);
    }

    // Notify Seeker to review worker
    const seekerNotif = {
      id: `n_${Date.now()}_seeker`,
      userId: gig.employerId,
      title: 'Service completed',
      message: `The gig "${gig.title}" is complete. Please leave a review for the worker.`,
      timestamp: 'Just now',
      read: false,
      type: 'booking' as const
    };
    db.updateNotifications([seekerNotif, ...notifications]);
  } else if (status === 'IN_PROGRESS') {
    // Notify Seeker that worker started
    const seekerNotif = {
      id: `n_${Date.now()}_started`,
      userId: gig.employerId,
      title: 'Service started',
      message: `Your worker has checked in and started working on: "${gig.title}"`,
      timestamp: 'Just now',
      read: false,
      type: 'booking' as const
    };
    db.updateNotifications([seekerNotif, ...notifications]);
  }
}

export async function recordAttendance(gigId: string, action: 'check-in' | 'check-out'): Promise<void> {
  await delay(400);
  const gigs = db.getGigs();
  const gigIndex = gigs.findIndex(g => g.id === gigId);

  if (gigIndex === -1) throw new Error('Gig not found.');
  const gig = gigs[gigIndex];

  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (action === 'check-in') {
    gigs[gigIndex] = {
      ...gig,
      checkInTime: now,
      status: 'IN_PROGRESS'
    };
    await changeGigStatus(gigId, 'IN_PROGRESS');
  } else {
    gigs[gigIndex] = {
      ...gig,
      checkOutTime: now,
      status: 'COMPLETED'
    };
    await changeGigStatus(gigId, 'COMPLETED');
  }
  db.updateGigs(gigs);
}

export async function getMyGigs(userId: string, role: UserRole): Promise<Gig[]> {
  await delay(300);
  const gigs = db.getGigs();

  if (role === 'seeker') {
    return gigs.filter(g => g.employerId === userId);
  } else {
    // worker
    return gigs.filter(g => g.assignedWorkerIds.includes(userId) || g.applicationStatus !== null);
  }
}

export async function parseAIPrompt(prompt: string): Promise<any> {
  await delay(500);
  const lower = prompt.toLowerCase();
  
  const paymentMatch = prompt.match(/(?:₹|rs\.?|rupees?)\s?(\d+)/i)?.[1] || prompt.match(/\b(\d{3,5})\b/)?.[1] || "500";
  const workersMatch = prompt.match(/\b(\d+)\s?(helpers?|workers?|people|staff|cleaners?)\b/i)?.[1] || "1";
  
  let title = "Helper";
  let category = "General";
  let skills = ["Basic communication"];

  if (lower.includes("clean") || lower.includes("wash") || lower.includes("dust")) {
    title = "Cleaning Specialist";
    category = "Cleaning";
    skills = ["Deep Cleaning", "Organization"];
  } else if (lower.includes("wire") || lower.includes("electr") || lower.includes("fan") || lower.includes("switch")) {
    title = "Electrical Technician";
    category = "Repairs";
    skills = ["Wiring & Repairs", "Appliance Installation"];
  } else if (lower.includes("garden") || lower.includes("plant") || lower.includes("mow")) {
    title = "Garden Decorator / Helper";
    category = "Gardening";
    skills = ["Pruning & Hedging", "Potting & Soil Mix"];
  } else if (lower.includes("cook") || lower.includes("chef") || lower.includes("kitchen")) {
    title = "Kitchen Catering Helper";
    category = "Cooking";
    skills = ["Food prep", "Kitchen hygiene"];
  }

  return {
    title,
    description: `AI Parsed Request: "${prompt}"`,
    category,
    requiredSkills: skills,
    workersRequired: Number(workersMatch),
    date: lower.includes("tomorrow") 
      ? new Date(Date.now() + 86400000).toISOString().slice(0, 10) 
      : new Date().toISOString().slice(0, 10),
    startTime: prompt.match(/\b(\d{1,2})\s?(am|pm)\b/i)?.[0]?.toUpperCase() || "10:00 AM",
    endTime: prompt.match(/to\s?(\d{1,2})\s?(am|pm)\b/i)?.[0]?.replace(/to\s?/i, '').toUpperCase() || "2:00 PM",
    duration: "4h",
    paymentType: "fixed",
    paymentAmount: Number(paymentMatch),
    location: "Benz Circle, Vijayawada",
    urgency: lower.includes("urgent") || lower.includes("emergency") || lower.includes("now") ? "urgent" : "normal"
  };
}
