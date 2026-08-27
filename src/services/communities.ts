import { db } from '../mock/data';
import { Community, CooperativeGig } from '../types';
import { delay } from './api';

export async function getCommunities(): Promise<Community[]> {
  await delay(400);
  return db.getCommunities();
}

export async function getCommunityById(id: string): Promise<Community | null> {
  await delay(250);
  const communities = db.getCommunities();
  const community = communities.find(c => c.id === id);
  return community || null;
}

export async function getCoopGigs(communityId?: string): Promise<CooperativeGig[]> {
  await delay(300);
  let coopGigs = db.getCoopGigs();
  if (communityId) {
    coopGigs = coopGigs.filter(cg => cg.communityId === communityId);
  }
  return coopGigs;
}

export async function getCoopGigById(id: string): Promise<CooperativeGig | null> {
  await delay(200);
  const coopGigs = db.getCoopGigs();
  const gig = coopGigs.find(cg => cg.id === id);
  return gig || null;
}

export async function joinCoopGig(coopGigId: string, requestedSkill: string): Promise<CooperativeGig> {
  await delay(600);
  const coopGigs = db.getCoopGigs();
  const index = coopGigs.findIndex(cg => cg.id === coopGigId);
  if (index === -1) throw new Error('Cooperative gig not found.');

  const gig = coopGigs[index];
  const currentUser = db.getCurrentUser();
  if (!currentUser || currentUser.role !== 'worker') {
    throw new Error('Only authenticated gig workers can join cooperative gigs.');
  }

  // Check if already joined
  if (gig.joinedWorkers.some(w => w.id === currentUser.id)) {
    throw new Error('You have already joined this cooperative gig.');
  }

  // Find the skill and increment filled count
  const skillIndex = gig.skillsRequired.findIndex(
    s => s.skill.toLowerCase() === requestedSkill.toLowerCase()
  );
  if (skillIndex === -1) {
    throw new Error(`The role for skill "${requestedSkill}" is not required or already filled.`);
  }

  const skillData = gig.skillsRequired[skillIndex];
  if (skillData.filled >= skillData.count) {
    throw new Error(`All positions for "${requestedSkill}" have already been filled.`);
  }

  // Update filled count
  const updatedSkills = [...gig.skillsRequired];
  updatedSkills[skillIndex] = {
    ...skillData,
    filled: skillData.filled + 1
  };

  // Add worker
  const updatedWorkers = [
    ...gig.joinedWorkers,
    {
      id: currentUser.id,
      name: currentUser.name,
      avatarUrl: currentUser.avatarUrl,
      role: requestedSkill
    }
  ];

  // Check if fully filled
  const totalRequired = updatedSkills.reduce((sum, s) => sum + s.count, 0);
  const totalFilled = updatedSkills.reduce((sum, s) => sum + s.filled, 0);
  const updatedStatus = totalFilled >= totalRequired ? 'filled' : 'open';

  const updatedGig: CooperativeGig = {
    ...gig,
    joinedWorkers: updatedWorkers,
    skillsRequired: updatedSkills,
    status: updatedStatus
  };

  coopGigs[index] = updatedGig;
  db.updateCoopGigs(coopGigs);

  // Notify community activity feed
  const communities = db.getCommunities();
  const commIndex = communities.findIndex(c => c.id === gig.communityId);
  if (commIndex !== -1) {
    const community = communities[commIndex];
    const newActivity = {
      id: `act_${Date.now()}`,
      text: `${currentUser.name} joined the coop gig "${gig.title}" as ${requestedSkill}.`,
      timestamp: 'Just now'
    };
    communities[commIndex] = {
      ...community,
      activityFeed: [newActivity, ...community.activityFeed]
    };
    db.updateCommunities(communities);
  }

  // Add notification
  const notifications = db.getNotifications();
  const newNotif = {
    id: `n_${Date.now()}`,
    userId: currentUser.id,
    title: 'Joined Cooperative Gig',
    message: `You successfully joined "${gig.title}" as ${requestedSkill}. The payout distribution is active.`,
    timestamp: 'Just now',
    read: false,
    type: 'community' as const
  };
  db.updateNotifications([newNotif, ...notifications]);

  return updatedGig;
}
