import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-zinc-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-500 shadow-md shadow-indigo-500/20">
              <ShieldAlert className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading text-sm font-bold text-white">
              CivicNavigator
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} AI Civic Navigator. Intelligent Public Grievance & Resolution Platform.
          </p>
          <div className="flex space-x-6 text-xs text-zinc-500">
            <span className="hover:text-zinc-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-zinc-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-zinc-300 cursor-pointer">Official Portal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
