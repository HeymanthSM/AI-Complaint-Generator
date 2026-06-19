'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuthStore } from '@/store/authStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import {
  BarChart3,
  TrendingUp,
  Award,
  Heart,
  Brain,
  Lightbulb,
  FileSpreadsheet,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialized && !user) {
      router.push('/auth/login');
    }
  }, [initialized, user, router]);

  useEffect(() => {
    async function fetchAnalytics() {
      if (user) {
        setLoading(true);
        try {
          // Fetch full unified analytics
          const analytics = await api.get('/analytics/all');
          setData(analytics);
        } catch (err) {
          console.error('Failed to load analytics data', err);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchAnalytics();
  }, [user]);

  if (!initialized || !user || loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  // Normalize predictions: backend returns { predictions: { predictions: [...], ... } }
  const predictionsArray: any[] = Array.isArray(data.predictions)
    ? data.predictions
    : Array.isArray(data.predictions?.predictions)
      ? data.predictions.predictions
      : [];

  // Formatting categories for charts
  const categoryData = data.categoryDistribution.map((item: any) => ({
    name: item.category.replace('_', ' '),
    count: item.count,
  }));

  // Recharts theme colors
  const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#ec4899', '#f59e0b', '#3b82f6', '#8b5cf6', '#64748b'];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-indigo-400" />
            <span>Civic Intelligence Analytics</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Predictive AI trends, satisfaction ratings, and department performance reports.
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-zinc-900/40 border border-white/5">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Average Resolution SLA</span>
            <p className="text-2xl font-bold text-white mt-1">{data.overview?.avgResolutionDays || '8.5'} Days</p>
          </Card>
          <Card className="p-4 bg-zinc-900/40 border border-white/5">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Overall Satisfaction</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{data.overview?.satisfactionScore || '4.2'} / 5.0</p>
          </Card>
          <Card className="p-4 bg-zinc-900/40 border border-white/5">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Emergencies Contained</span>
            <p className="text-2xl font-bold text-red-400 mt-1">{data.overview?.emergencyCount || '23'}</p>
          </Card>
          <Card className="p-4 bg-zinc-900/40 border border-white/5">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Monthly Case Growth</span>
            <p className="text-2xl font-bold text-indigo-400 mt-1">+{data.overview?.growthPercent || '9.8'}%</p>
          </Card>
        </div>

        {/* First Chart row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trend chart */}
          <Card className="lg:col-span-2 p-6 flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              <h2 className="font-heading text-lg font-bold text-white">Monthly Grievance Trends</h2>
            </div>
            <div className="h-72 w-full pt-4">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <LineChart data={data.trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(10, 10, 10, 0.95)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="complaints" name="Logged" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Category distribution */}
          <Card className="p-6 flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5 text-indigo-400" />
              <h2 className="font-heading text-lg font-bold text-white">Issue Categories</h2>
            </div>
            <div className="h-72 w-full flex items-center justify-center pt-2">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie
                      data={categoryData.slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {categoryData.slice(0, 5).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                      height={40}
                      iconType="circle"
                      formatter={(value) => <span className="text-[10px] text-zinc-400">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        {/* Second Row: Department performance & Predictive intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Department performance bar chart */}
          <Card className="lg:col-span-2 p-6 flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-indigo-400" />
              <h2 className="font-heading text-lg font-bold text-white">Department Resolution Rates</h2>
            </div>
            <div className="h-72 w-full pt-4">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={data.departmentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="code" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(10, 10, 10, 0.95)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="total" name="Total Cases" fill="rgba(99, 102, 241, 0.25)" stroke="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resolved" name="Resolved Cases" fill="rgba(16, 185, 129, 0.8)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Predictive Intelligence panel */}
          <Card className="p-6 flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-indigo-400 animate-pulse" />
              <h2 className="font-heading text-lg font-bold text-white">AI Predictions (Monsoon)</h2>
            </div>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Machine learning forecasting model projecting incident likelihoods for the upcoming calendar month based on weather triggers.
            </p>

            <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
              {predictionsArray.map((pred: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg border border-white/5 bg-zinc-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase">{pred.category.replace('_', ' ')}</span>
                    <Badge variant={(pred.predictedComplaints || pred.predictedCount || 0) > 50 ? 'danger' : 'warning'}>
                      {pred.predictedComplaints || pred.predictedCount || 0} Cases
                    </Badge>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    {pred.reasoning || pred.reason || 'Seasonal pattern detected'}
                  </p>
                  <div className="flex items-center gap-1.5 text-[9px] text-indigo-400 bg-indigo-500/5 p-1 rounded">
                    <Lightbulb className="h-3 w-3 shrink-0" />
                    <span>Focus: {pred.affectedAreas?.join(', ') || 'Multiple wards'}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
