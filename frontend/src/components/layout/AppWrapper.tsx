'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { ToastContainer } from '../ui/Toast';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
