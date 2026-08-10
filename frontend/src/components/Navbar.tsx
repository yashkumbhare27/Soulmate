'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SpecularLogo } from './SpecularLogo';
import { LogOut, User, MessageCircle, ShieldAlert, Award } from 'lucide-react';

export const Navbar: React.FC = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-40 w-full px-6 py-4 glass-panel border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        
        {/* Left: Branding */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <SpecularLogo size={42} showText={false} />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-brand-gradient">
              SoulMate AI
            </span>
            <span className="hidden md:inline text-[9px] tracking-wider text-primary opacity-80 uppercase">
              The Matchmaking AI That Tells You Why
            </span>
          </div>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/10 transition-colors"
          >
            <Award className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Matches</span>
          </Link>

          <Link
            href="/chat"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/10 transition-colors"
          >
            <MessageCircle className="h-4 w-4 text-secondary" />
            <span className="hidden sm:inline">Chats</span>
          </Link>

          <Link
            href="/profile"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/10 transition-colors"
          >
            <User className="h-4 w-4 text-primary-light" />
            <span className="hidden sm:inline">Onboarding</span>
          </Link>

          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/10 transition-colors"
          >
            <ShieldAlert className="h-4 w-4 text-accent-ai" />
            <span className="hidden sm:inline">Admin</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-error/10 text-error/85 transition-colors"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Log Out</span>
          </button>
        </div>

      </div>
    </nav>
  );
};
export default Navbar;
