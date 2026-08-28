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
  const data = await apiCall<{ user: ApiUser; token?: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (typeof window !== 'undefined') {
    if (data.token) localStorage.setItem('flexywork_token', data.token);
    window.dispatchEvent(new Event('auth-change'));
  }
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
  const data = await apiCall<{ user: ApiUser; token?: string }>('/api/auth/register', {
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
  if (typeof window !== 'undefined') {
    if (data.token) localStorage.setItem('flexywork_token', data.token);
    window.dispatchEvent(new Event('auth-change'));
  }
  return fromApiUser(data.user);
}

export async function logout(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('flexywork_token');
  }
  await apiCall<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }).catch(() => {});
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-change'));
  }
}

export async function getMe(): Promise<User | null> {
  try {
    const data = await apiCall<{ user: ApiUser }>('/api/auth/me');
    return fromApiUser(data.user);
  } catch {
    return null;
  }
}
