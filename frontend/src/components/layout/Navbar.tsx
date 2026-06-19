'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { MessageSquare, LayoutDashboard, FileText, BarChart3, Map, ShieldAlert, LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLinkActive = (path: string) => {
    return pathname === path;
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { name: 'File Grievance', path: '/complaints', icon: <FileText className="h-4 w-4" /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { name: 'Heatmap', path: '/heatmap', icon: <Map className="h-4 w-4" /> },
    { name: 'AI Assistant', path: '/chatbot', icon: <MessageSquare className="h-4 w-4" /> },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/70 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 shadow-md shadow-indigo-500/20">
                <ShieldAlert className="h-5 w-5 text-white" />
                <div className="absolute inset-0 -z-10 rounded-xl bg-indigo-500 blur-md opacity-30 animate-pulse" />
              </div>
              <span className="font-heading text-lg font-bold tracking-tight text-white">
                Civic<span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Navigator</span>
              </span>
            </Link>
          </div>

          {/* Links (desktop) */}
          {mounted && user && (
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isLinkActive(link.path)
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 border border-transparent'
                  }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>
          )}

          {/* User Section / Actions (desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {mounted && user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-white/5 bg-zinc-900/45">
                  <div className="h-5 w-5 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <UserIcon className="h-3 w-3 text-indigo-400" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-300 max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-500 font-bold border border-white/5 uppercase">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 rounded-lg transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger menu button (mobile) */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 focus:outline-none transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-5.5 w-5.5" />
              ) : (
                <Menu className="h-5.5 w-5.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && mounted && (
        <div className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-md px-4 py-4 space-y-4">
          {user ? (
            <>
              {/* Navigation Links */}
              <div className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isLinkActive(link.path)
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 border border-transparent'
                    }`}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </Link>
                ))}
              </div>

              {/* User profile & actions */}
              <div className="pt-4 border-t border-white/5 flex flex-col space-y-3">
                <div className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl border border-white/5 bg-zinc-900/45">
                  <div className="h-7 w-7 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <UserIcon className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-300 truncate">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-medium capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center justify-center space-x-2 w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col space-y-2.5 pt-1">
              <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} className="w-full">
                <Button variant="ghost" className="w-full justify-center">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register" onClick={() => setIsMenuOpen(false)} className="w-full">
                <Button variant="primary" className="w-full justify-center">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
