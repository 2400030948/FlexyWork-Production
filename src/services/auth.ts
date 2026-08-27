import { db } from '../mock/data';
import { User, UserRole } from '../types';
import { delay, apiCall } from './api';

export async function login(email: string, password: string): Promise<User> {
  await delay(600); // Simulate network delay
  
  const users = db.getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    throw new Error('User not found with this email.');
  }
  
  db.setCurrentUser(user);
  return user;
}

export async function signup(
  name: string,
  email: string,
  role: UserRole,
  location: string,
  businessName?: string
): Promise<User> {
  await delay(800);
  
  const users = db.getUsers();
  if (users.some(u => u.email === email)) {
    throw new Error('An account with this email already exists.');
  }

  const userId = `user_${Date.now()}`;
  const newUser: User = {
    id: userId,
    name,
    email,
    role,
    location,
    avatarUrl: `/avatars/placeholder.jpg`
  };

  // Add to user store
  db.updateUsers([...users, newUser]);

  // If worker, seed profile
  if (role === 'worker') {
    const workers = db.getWorkers();
    const newWorkerProfile = {
      id: `w_${Date.now()}`,
      userId,
      name,
      email,
      skills: [],
      bio: 'New gig worker on FLEXYWORK. Ready for opportunities!',
      location,
      distance: 0.1,
      rating: 5.0,
      completedGigsCount: 0,
      reliabilityScore: 100,
      hourlyRate: 200,
      isVerified: false,
      isTopRated: false,
      availability: [
        { day: 'Mon', status: 'Available', ranges: ['9 AM - 5 PM'] },
        { day: 'Tue', status: 'Available', ranges: ['9 AM - 5 PM'] },
        { day: 'Wed', status: 'Available', ranges: ['9 AM - 5 PM'] },
        { day: 'Thu', status: 'Available', ranges: ['9 AM - 5 PM'] },
        { day: 'Fri', status: 'Available', ranges: ['9 AM - 5 PM'] },
        { day: 'Sat', status: 'Unavailable', ranges: [] },
        { day: 'Sun', status: 'Unavailable', ranges: [] }
      ]
    };
    db.updateWorkers([...workers, newWorkerProfile]);
  }

  db.setCurrentUser(newUser);
  return newUser;
}

export async function logout(): Promise<void> {
  await delay(300);
  db.setCurrentUser(null);
}

export async function getMe(): Promise<User | null> {
  await delay(100);
  return db.getCurrentUser();
}
