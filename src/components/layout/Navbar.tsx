'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Briefcase, Bell, User, LogOut, Shield, Plus } from 'lucide-react';
import { User as UserType } from '../../types';
import { getMe, logout } from '../../services/auth';
import { getNotifications } from '../../services/notifications';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getMe();
      setCurrentUser(user);

      if (user) {
        const notifs = await getNotifications();
        const unread = notifs.filter(n => !n.read).length;
        setUnreadCount(unread);
      } else {
        setUnreadCount(0);
      }
    };

    fetchUser();
    window.addEventListener('auth-change', fetchUser);
    const interval = setInterval(fetchUser, 15000);
    return () => {
      window.removeEventListener('auth-change', fetchUser);
      clearInterval(interval);
    };
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setShowDropdown(false);
    router.push('/');
  };

  // Determine active portal context based on current route
  const isWorkerPortal = pathname.startsWith('/worker');
  const isAdminPortal = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href={currentUser ? (currentUser.role === 'worker' ? '/worker' : '/home') : '/'} className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white font-bold text-lg shadow-sm shadow-brand-500/20">
              F
            </span>
            <span className="font-extrabold text-xl tracking-tight text-ink">
              FLEXY<span className="text-brand-500 font-semibold">WORK</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          {currentUser && !isAdminPortal && (
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-ink-muted">
              {currentUser.role !== 'worker' ? (
                <>
                  <Link href="/home" className={`px-3 py-2 rounded-md transition-colors hover:text-ink ${pathname === '/home' ? 'text-ink font-semibold' : ''}`}>
                    Dashboard
                  </Link>
                  <Link 
                    href="/post-gig" 
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs flex items-center gap-1 ${
                      pathname === '/post-gig' 
                        ? 'bg-brand-500 text-white shadow-xs' 
                        : 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200'
                    }`}
                  >
                    + Post a Gig
                  </Link>
                  <Link href="/posted-gigs" className={`px-3 py-2 rounded-md transition-colors hover:text-ink ${pathname === '/posted-gigs' || pathname.startsWith('/bookings') ? 'text-ink font-semibold' : ''}`}>
                    My Posted Gigs
                  </Link>
                  <Link href="/explore" className={`px-3 py-2 rounded-md transition-colors hover:text-ink ${pathname === '/explore' ? 'text-ink font-semibold' : ''}`}>
                    Find Workers
                  </Link>
                  <Link href="/community" className={`px-3 py-2 rounded-md transition-colors hover:text-ink ${pathname.startsWith('/community') ? 'text-ink font-semibold' : ''}`}>
                    Collectives
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/worker" className={`px-3 py-2 rounded-md transition-colors hover:text-ink ${pathname === '/worker' ? 'text-ink font-semibold' : ''}`}>
                    Command Center
                  </Link>
                  <Link href="/worker/gigs" className={`px-3 py-2 rounded-md transition-colors hover:text-ink ${pathname.startsWith('/worker/gigs') ? 'text-ink font-semibold' : ''}`}>
                    Find & My Gigs
                  </Link>
                  <Link href="/worker/earnings" className={`px-3 py-2 rounded-md transition-colors hover:text-ink ${pathname === '/worker/earnings' ? 'text-ink font-semibold' : ''}`}>
                    Earnings
                  </Link>
                  <Link href="/worker/communities" className={`px-3 py-2 rounded-md transition-colors hover:text-ink ${pathname === '/worker/communities' ? 'text-ink font-semibold' : ''}`}>
                    Communities
                  </Link>
                </>
              )}
            </nav>
          )}

          {!currentUser && (
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-ink-muted">
              <Link href="/how-it-works" className="px-3 py-2 transition-colors hover:text-ink">
                How it works
              </Link>
              <Link href="/community" className="px-3 py-2 transition-colors hover:text-ink">
                Communities
              </Link>
            </nav>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          
          {currentUser && (
            <>
              {/* Notifications */}
              <Link 
                href="/notifications" 
                className="relative p-1.5 text-ink-muted hover:text-ink hover:bg-surface-card rounded-full transition-all"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                )}
              </Link>

              {/* Admin Access Panel Link if admin */}
              {currentUser.role === 'admin' && !isAdminPortal && (
                <Link 
                  href="/admin" 
                  className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded"
                >
                  <Shield size={14} /> Admin
                </Link>
              )}

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-card transition-all"
                >
                  <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm border border-brand-200">
                    {currentUser.name.charAt(0)}
                  </div>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-surface-border bg-white py-1 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-surface-border">
                      <p className="text-sm font-semibold text-ink">{currentUser.name}</p>
                      <p className="text-xs text-ink-muted truncate">{currentUser.email}</p>
                      <span className="inline-block text-[10px] font-extrabold uppercase bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full mt-1">
                        {currentUser.role === 'worker' ? 'Worker Account' : currentUser.role === 'admin' ? 'Admin Account' : 'Employer Account'}
                      </span>
                    </div>

                    <div className="py-1">
                      {currentUser.role !== 'worker' ? (
                        <>
                          <Link
                            href="/post-gig"
                            onClick={() => setShowDropdown(false)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-brand-700 font-semibold hover:bg-brand-50 transition-colors"
                          >
                            <Plus size={15} />
                            Post a Gig
                          </Link>
                          <Link
                            href="/posted-gigs"
                            onClick={() => setShowDropdown(false)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink-muted hover:bg-surface-card hover:text-ink transition-colors"
                          >
                            <Briefcase size={15} />
                            My Posted Gigs
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setShowDropdown(false)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink-muted hover:bg-surface-card hover:text-ink transition-colors"
                          >
                            <User size={15} />
                            Employer Profile
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/worker/gigs"
                            onClick={() => setShowDropdown(false)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-brand-700 font-semibold hover:bg-brand-50 transition-colors"
                          >
                            <Briefcase size={15} />
                            Find & My Gigs
                          </Link>
                          <Link
                            href="/worker/profile"
                            onClick={() => setShowDropdown(false)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink-muted hover:bg-surface-card hover:text-ink transition-colors"
                          >
                            <User size={15} />
                            Worker Profile
                          </Link>
                        </>
                      )}

                    {currentUser.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setShowDropdown(false)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink-muted hover:bg-surface-card hover:text-ink transition-colors"
                      >
                        <Shield size={15} />
                        Admin Dashboard
                      </Link>
                    )}
                    </div>

                    <div className="border-t border-surface-border py-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut size={15} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Dynamic Language Switcher (English / Marathi / Hindi / Telugu) */}
          <LanguageSelector />

          {!currentUser && (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-semibold text-ink-muted hover:text-ink transition-colors">
                Login
              </Link>
              <Link 
                href="/signup" 
                className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
