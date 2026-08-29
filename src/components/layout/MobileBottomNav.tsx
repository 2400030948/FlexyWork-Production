'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Calendar, Users, User, LayoutDashboard, Briefcase, IndianRupee } from 'lucide-react';
import { User as UserType } from '../../types';
import { getMe } from '../../services/auth';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setCurrentUser(await getMe());
    };
    fetchUser();
    window.addEventListener('auth-change', fetchUser);
    const interval = setInterval(fetchUser, 15000);
    return () => {
      window.removeEventListener('auth-change', fetchUser);
      clearInterval(interval);
    };
  }, [pathname]);

  if (!currentUser) return null;

  const isWorker = currentUser.role === 'worker';

  // Employer / Seeker items
  const employerTabs = [
    { label: 'Home', href: '/home', icon: Home },
    { label: 'Post Shift', href: '/post-gig', icon: Briefcase },
    { label: 'My Shifts', href: '/posted-gigs', icon: Calendar },
    { label: 'Workers', href: '/explore', icon: Search },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  // Worker items
  const workerTabs = [
    { label: 'Home', href: '/worker', icon: Home },
    { label: 'Find Work', href: '/worker/gigs', icon: Briefcase },
    { label: 'Earnings', href: '/worker/earnings', icon: IndianRupee },
    { label: 'Availability', href: '/worker/profile', icon: Calendar },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  const activeTabs = isWorker ? workerTabs : employerTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-surface-border bg-white/95 backdrop-blur-md pb-safe md:hidden shadow-xs">
      <div className="flex h-15 items-center justify-around px-2">
        {activeTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.href === '/home' || tab.href === '/worker'
            ? pathname === tab.href
            : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 text-[10px] font-semibold transition-all btn-press ${
                isActive ? 'text-brand-600 font-bold' : 'text-ink-subtle hover:text-ink'
              }`}
            >
              <Icon size={19} className={isActive ? 'stroke-[2.5px] text-brand-600' : 'stroke-[1.8px]'} />
              <span className="mt-0.5 tracking-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
