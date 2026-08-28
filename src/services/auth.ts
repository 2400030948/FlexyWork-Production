import { User, UserRole } from '../types';
import { apiCall } from './api';

type ApiUser = Omit<User, 'role' | 'avatarUrl'> & {
  role: 'worker' | 'employer' | 'admin';
  profileImage?: string;
};

function fromApiUser(user: ApiUser): User {
  return {
    ...user,
    role: user.role === 'employer' ? 'seeker' : user.role,
    avatarUrl: user.profileImage
  };
}

function toApiRole(role: UserRole): 'worker' | 'employer' {
  return role === 'worker' ? 'worker' : 'employer';
}

export async function login(email: string, password: string): Promise<User> {
  const data = await apiCall<{ user: ApiUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  return fromApiUser(data.user);
}

export async function signup(
  name: string,
  email: string,
  password: string,
  role: UserRole,
  location: string,
  businessName?: string
): Promise<User> {
  const data = await apiCall<{ user: ApiUser }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      password,
      role: toApiRole(role),
      location,
      businessName
    })
  });
  return fromApiUser(data.user);
}

export async function logout(): Promise<void> {
  await apiCall<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
}

export async function getMe(): Promise<User | null> {
  try {
    const data = await apiCall<{ user: ApiUser }>('/api/auth/me');
    return fromApiUser(data.user);
  } catch {
    return null;
  }
}
