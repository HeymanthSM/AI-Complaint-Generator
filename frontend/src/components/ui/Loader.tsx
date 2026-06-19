import React from 'react';
import { cn } from '../../lib/utils';

export function Loader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-10', className)}>
      <div className="relative flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
        <div className="absolute h-6 w-6 animate-ping rounded-full bg-cyan-500/20" />
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
      <Loader />
      <p className="mt-4 font-heading text-sm text-indigo-400 font-medium tracking-wide animate-pulse">
        AI Civic Navigator Loading...
      </p>
    </div>
  );
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
}

export function Skeleton({ className, variant = 'rect', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-zinc-800/60 border border-white/5',
        variant === 'circle' && 'rounded-full',
        variant === 'text' && 'h-4 w-3/4 rounded',
        variant === 'rect' && 'rounded-xl',
        className
      )}
      {...props}
    />
  );
}
