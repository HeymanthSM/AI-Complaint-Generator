'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuthStore } from '@/store/authStore';
import { useComplaintStore } from '@/store/complaintStore';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Loader } from '@/components/ui/Loader';
import { formatDate, getStatusColor, getPriorityColor } from '@/lib/utils';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  RotateCcw,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const {
    complaints,
    totalComplaints,
    totalPages,
    currentPage,
    loading,
    filters,
    setFilters,
    resetFilters,
    fetchComplaints,
  } = useComplaintStore();

  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth Protection
  useEffect(() => {
    if (initialized && !user) {
      router.push('/auth/login');
    }
  }, [initialized, user, router]);

  // Fetch complaints on filter change
  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [
    filters.status,
    filters.category,
    filters.priority,
    filters.page,
    fetchComplaints,
    user
  ]);

  if (!initialized || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  // Calculate statistics
  const pendingCount = complaints.filter(c => ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED'].includes(c.status)).length;
  const inProgressCount = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;
  const emergencyCount = complaints.filter(c => c.isEmergency).length;

  const chartData = [
    { name: 'Pending', value: pendingCount || 1, color: '#6366f1' },
    { name: 'In Progress', value: inProgressCount || 0, color: '#eab308' },
    { name: 'Resolved', value: resolvedCount || 0, color: '#10b981' },
    { name: 'Emergency', value: emergencyCount || 0, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchTerm, page: 1 });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    resetFilters();
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-white">
              Citizen Dashboard
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              File, monitor, and audit your municipal complaints.
            </p>
          </div>
          <Link href="/complaints">
            <Button className="gap-2 font-semibold">
              <Plus className="h-4.5 w-4.5" />
              <span>Report New Issue</span>
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="flex items-center space-x-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <FileText className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Reports</p>
              <h3 className="font-heading text-2xl font-bold text-white">{totalComplaints}</h3>
            </div>
          </Card>

          <Card className="flex items-center space-x-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Clock className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Active</p>
              <h3 className="font-heading text-2xl font-bold text-white">
                {totalComplaints - resolvedCount}
              </h3>
            </div>
          </Card>

          <Card className="flex items-center space-x-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Resolved</p>
              <h3 className="font-heading text-2xl font-bold text-white">{resolvedCount}</h3>
            </div>
          </Card>

          <Card className="flex items-center space-x-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 animate-pulse">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Emergencies</p>
              <h3 className="font-heading text-2xl font-bold text-red-400">{emergencyCount}</h3>
            </div>
          </Card>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Table Card */}
          <Card className="lg:col-span-2 p-6 flex flex-col space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="font-heading text-xl font-bold text-white">Grievance List</h2>
              
              {/* Reset Filters */}
              {(filters.status || filters.category || filters.priority || filters.search) && (
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="relative sm:col-span-2">
                <Input
                  type="text"
                  placeholder="Search title, desc..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              </div>
              <Select
                value={filters.status || ''}
                onChange={(e) => setFilters({ status: e.target.value, page: 1 })}
                className="h-10"
              >
                <option value="">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="ESCALATED">Escalated</option>
              </Select>
              <Select
                value={filters.priority || ''}
                onChange={(e) => setFilters({ priority: e.target.value, page: 1 })}
                className="h-10"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
                <option value="EMERGENCY">Emergency</option>
              </Select>
            </form>

            {/* Table / List */}
            {loading ? (
              <Loader />
            ) : complaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-white">No complaints found</h3>
                  <p className="text-zinc-500 text-xs mt-1">Try resetting filters or lodge a new complaint.</p>
                </div>
                <Link href="/complaints">
                  <Button size="sm">File a Grievance</Button>
                </Link>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between">
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="pb-3">Title</th>
                        <th className="pb-3">Department</th>
                        <th className="pb-3">Priority</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {complaints.map((complaint) => (
                        <tr key={complaint.id} className="hover:bg-white/2 transition-colors duration-150">
                          <td className="py-4 pr-3 max-w-[200px] truncate font-medium text-white">
                            {complaint.title}
                          </td>
                          <td className="py-4 text-xs text-zinc-400">
                            {complaint.department?.name || 'Assigned automatically'}
                          </td>
                          <td className="py-4 text-xs">
                            <Badge className={getPriorityColor(complaint.priority)}>
                              {complaint.priority}
                            </Badge>
                          </td>
                          <td className="py-4 text-xs">
                            <Badge className={getStatusColor(complaint.status)}>
                              {complaint.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-4 text-xs text-zinc-500">
                            {formatDate(complaint.createdAt)}
                          </td>
                          <td className="py-4 text-right">
                            <Link href={`/complaints/${complaint.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View details">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Card List */}
                <div className="block md:hidden space-y-3">
                  {complaints.map((complaint) => (
                    <div
                      key={complaint.id}
                      className="p-4.5 rounded-xl border border-white/5 bg-zinc-900/25 hover:bg-zinc-900/40 transition-colors space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-heading text-sm font-bold text-white leading-snug">
                          {complaint.title}
                        </h4>
                        <Link href={`/complaints/${complaint.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" title="View details">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <Badge className={getPriorityColor(complaint.priority)}>
                          {complaint.priority}
                        </Badge>
                        <Badge className={getStatusColor(complaint.status)}>
                          {complaint.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-2 border-t border-white/2">
                        <span className="truncate max-w-[170px]">
                          Dept: <span className="text-zinc-400 font-medium">{complaint.department?.name || 'Auto Assigned'}</span>
                        </span>
                        <span>{formatDate(complaint.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
                    <p className="text-xs text-zinc-500">
                      Page <span className="font-semibold text-zinc-300">{currentPage}</span> of{' '}
                      <span className="font-semibold text-zinc-300">{totalPages}</span>
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Right Column: Chart & Tips */}
          <div className="flex flex-col space-y-8">
            {/* Status distribution chart */}
            <Card className="p-6 flex flex-col space-y-4">
              <h2 className="font-heading text-lg font-bold text-white">Status Breakdown</h2>
              <div className="h-56 w-full flex items-center justify-center">
                {mounted && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(10, 10, 10, 0.95)',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-xs text-zinc-400">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-zinc-500 text-xs">Awaiting data...</div>
                )}
              </div>
            </Card>

            {/* Quick Actions & Tips */}
            <Card className="p-6 space-y-4 bg-gradient-to-br from-indigo-950/20 to-cyan-950/20 border-indigo-500/10">
              <h3 className="font-heading text-md font-bold text-white flex items-center gap-2">
                <span>Platform Tips</span>
              </h3>
              <ul className="space-y-3 text-xs text-zinc-400 leading-relaxed list-disc pl-4">
                <li>
                  <strong className="text-zinc-300">Translate:</strong> Write complaints in English, Hindi, or Tamil. The AI will translate it instantly for government record.
                </li>
                <li>
                  <strong className="text-zinc-300">Audits:</strong> Every action taken on your complaint generates a cryptographic proof. Click on a complaint to verify its timeline integrity.
                </li>
                <li>
                  <strong className="text-zinc-300">AI Assistant:</strong> Open the AI Assistant tab to ask about local bylaws, or query your complaint statuses conversationally.
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
