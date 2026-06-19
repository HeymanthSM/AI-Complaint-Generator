import { create } from 'zustand';
import { Complaint, AuditBlock } from '../types';
import { api } from '../lib/api';

interface FilterState {
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
  page: number;
  limit: number;
}

interface ComplaintState {
  complaints: Complaint[];
  totalComplaints: number;
  totalPages: number;
  currentPage: number;
  currentComplaint: Complaint | null;
  auditTrail: AuditBlock[];
  loading: boolean;
  submitLoading: boolean;
  error: string | null;
  filters: FilterState;
  
  setFilters: (newFilters: Partial<FilterState>) => void;
  resetFilters: () => void;
  fetchComplaints: () => Promise<void>;
  fetchComplaintById: (id: string) => Promise<Complaint>;
  fetchAuditTrail: (id: string) => Promise<AuditBlock[]>;
  createComplaint: (formData: FormData) => Promise<any>;
}

const initialFilters: FilterState = {
  status: '',
  category: '',
  priority: '',
  search: '',
  page: 1,
  limit: 10,
};

export const useComplaintStore = create<ComplaintState>((set, get) => ({
  complaints: [],
  totalComplaints: 0,
  totalPages: 1,
  currentPage: 1,
  currentComplaint: null,
  auditTrail: [],
  loading: false,
  submitLoading: false,
  error: null,
  filters: initialFilters,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  resetFilters: () => {
    set({ filters: initialFilters });
  },

  fetchComplaints: async () => {
    set({ loading: true, error: null });
    try {
      const { status, category, priority, search, page, limit } = get().filters;
      
      const queryParams = new URLSearchParams();
      if (status) queryParams.append('status', status);
      if (category) queryParams.append('category', category);
      if (priority) queryParams.append('priority', priority);
      if (search) queryParams.append('search', search);
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      const response = await api.get(`/complaints?${queryParams.toString()}`);
      
      set({
        complaints: response.complaints || [],
        totalComplaints: response.pagination?.total || 0,
        totalPages: response.pagination?.pages || 1,
        currentPage: response.pagination?.page || 1,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch complaints', loading: false });
    }
  },

  fetchComplaintById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/complaints/${id}`);
      set({ currentComplaint: response.complaint, loading: false });
      return response.complaint;
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch complaint details', loading: false });
      throw err;
    }
  },

  fetchAuditTrail: async (id) => {
    try {
      const response = await api.get(`/complaints/${id}/audit`);
      set({ auditTrail: response.auditTrail || [] });
      return response.auditTrail || [];
    } catch (err: any) {
      console.error('Audit trail fetch error:', err);
      return [];
    }
  },

  createComplaint: async (formData: FormData) => {
    set({ submitLoading: true, error: null });
    try {
      const response = await api.post('/complaints', formData);
      set({ submitLoading: false });
      // Refresh complaints list
      get().fetchComplaints();
      return response;
    } catch (err: any) {
      set({ error: err.message || 'Failed to submit complaint', submitLoading: false });
      throw err;
    }
  },
}));
