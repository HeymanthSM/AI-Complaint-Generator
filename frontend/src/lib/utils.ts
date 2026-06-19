export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export function formatDate(dateString: string | Date | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string | Date | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'SUBMITTED':
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
    case 'UNDER_REVIEW':
      return 'bg-purple-500/10 text-purple-400 border border-purple-500/30';
    case 'ASSIGNED':
      return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30';
    case 'IN_PROGRESS':
      return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
    case 'RESOLVED':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    case 'ESCALATED':
      return 'bg-orange-500/10 text-orange-400 border border-orange-500/30';
    default:
      return 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/30';
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'LOW':
      return 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20';
    case 'MEDIUM':
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    case 'HIGH':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case 'CRITICAL':
      return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
    case 'EMERGENCY':
      return 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse';
    default:
      return 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20';
  }
}
