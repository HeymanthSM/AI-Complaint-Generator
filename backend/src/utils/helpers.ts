import crypto from 'crypto';

/**
 * Generate a unique complaint reference number
 */
export function generateComplaintRef(): string {
  const date = new Date();
  const prefix = 'CIV';
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${year}${month}-${random}`;
}

/**
 * Calculate estimated resolution date based on priority
 */
export function estimateResolutionDate(priority: string): Date {
  const daysMap: Record<string, number> = {
    EMERGENCY: 1,
    CRITICAL: 3,
    HIGH: 7,
    MEDIUM: 14,
    LOW: 30,
  };
  const days = daysMap[priority] || 14;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Slugify a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Generate pagination metadata
 */
export function getPaginationMeta(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Parse sort query parameter
 */
export function parseSortParam(sort?: string): { field: string; order: 'asc' | 'desc' } {
  if (!sort) return { field: 'createdAt', order: 'desc' };
  const isDesc = sort.startsWith('-');
  const field = isDesc ? sort.slice(1) : sort;
  return { field, order: isDesc ? 'desc' : 'asc' };
}
