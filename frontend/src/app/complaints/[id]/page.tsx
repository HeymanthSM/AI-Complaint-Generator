'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuthStore } from '@/store/authStore';
import { useComplaintStore } from '@/store/complaintStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { formatDate, formatDateTime, getStatusColor, getPriorityColor } from '@/lib/utils';
import {
  FileText,
  MapPin,
  Lock,
  Calendar,
  AlertCircle,
  Link as LinkIcon,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Share2
} from 'lucide-react';
import { showToast } from '@/components/ui/Toast';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ComplaintDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const complaintId = resolvedParams.id;

  const { user, initialized } = useAuthStore();
  const {
    currentComplaint,
    auditTrail,
    loading,
    fetchComplaintById,
    fetchAuditTrail,
  } = useComplaintStore();

  const [activeTab, setActiveTab] = useState<'details' | 'letter' | 'blockchain'>('details');
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (initialized && !user) {
      router.push('/auth/login');
    }
  }, [initialized, user, router]);

  useEffect(() => {
    if (user && complaintId) {
      setFetchError(false);
      fetchComplaintById(complaintId).catch(() => setFetchError(true));
      fetchAuditTrail(complaintId);
    }
  }, [complaintId, user, fetchComplaintById, fetchAuditTrail]);

  if (!initialized || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  if (fetchError && !currentComplaint) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-zinc-500" />
          </div>
          <h2 className="font-heading text-xl font-bold text-white">Complaint Not Found</h2>
          <p className="text-zinc-500 text-sm text-center max-w-md">
            This complaint may have been removed or is not accessible. If you just filed it, try refreshing the page.
          </p>
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading || !currentComplaint) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast.success('Complaint link copied to clipboard!');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 space-y-8">
        {/* Back navigation & share toolbar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-zinc-200 gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5">
            <Share2 className="h-4 w-4" />
            <span>Share Case</span>
          </Button>
        </div>

        {/* Overview Header */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 items-center">
                <Badge className={getPriorityColor(currentComplaint.priority)}>
                  {currentComplaint.priority}
                </Badge>
                <Badge className={getStatusColor(currentComplaint.status)}>
                  {currentComplaint.status.replace('_', ' ')}
                </Badge>
                {currentComplaint.isEmergency && (
                  <Badge variant="danger" className="animate-pulse">
                    Emergency Alert
                  </Badge>
                )}
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {currentComplaint.title}
              </h1>
              <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Filed: {formatDateTime(currentComplaint.createdAt)}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Estimated Resolution: {formatDate(currentComplaint.estimatedResolution)}</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end justify-between h-full">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Case ID</span>
              <span className="font-mono text-xs text-zinc-400 mt-1 select-all">{currentComplaint.id}</span>
            </div>
          </div>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/5 space-x-6 text-sm overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 font-semibold transition-all border-b-2 shrink-0 ${
              activeTab === 'details'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Issue Details
          </button>
          <button
            onClick={() => setActiveTab('letter')}
            className={`pb-3 font-semibold transition-all border-b-2 shrink-0 ${
              activeTab === 'letter'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            AI Draft Letter
          </button>
          <button
            onClick={() => setActiveTab('blockchain')}
            className={`pb-3 font-semibold transition-all border-b-2 shrink-0 ${
              activeTab === 'blockchain'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Blockchain Ledger
          </button>
        </div>

        {/* Tab Contents */}
        <div className="space-y-6">
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Description & Metadata */}
              <div className="md:col-span-2 space-y-6">
                <Card className="p-6 space-y-4">
                  <h3 className="font-heading text-lg font-bold text-white">Description</h3>
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {currentComplaint.description}
                  </p>
                </Card>

                {/* Location Map Summary */}
                {currentComplaint.address && (
                  <Card className="p-6 space-y-4">
                    <h3 className="font-heading text-lg font-bold text-white flex items-center gap-1.5">
                      <MapPin className="h-5 w-5 text-indigo-400" />
                      <span>Incident Location</span>
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{currentComplaint.address}</p>
                    <div className="h-44 w-full rounded-lg bg-zinc-950/70 border border-white/5 flex items-center justify-center text-zinc-500 text-xs font-mono">
                      GPS coordinates: [{currentComplaint.latitude?.toFixed(6) || '0'}, {currentComplaint.longitude?.toFixed(6) || '0'}]
                    </div>
                  </Card>
                )}
              </div>

              {/* Right Column: Visual proofs & Dept Info */}
              <div className="space-y-6">
                {/* Department Info */}
                <Card className="p-6 space-y-4 bg-indigo-950/10 border-indigo-500/10">
                  <h3 className="font-heading text-md font-bold text-white">Routed Department</h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-zinc-500">Department Name</span>
                      <p className="text-zinc-300 font-bold mt-0.5">
                        {currentComplaint.department?.name || 'Department routing in progress'}
                      </p>
                    </div>
                    <div>
                      <span className="text-zinc-500">Service SLA Code</span>
                      <p className="text-zinc-400 font-mono mt-0.5">{currentComplaint.department?.code || 'Pending'}</p>
                    </div>
                  </div>
                </Card>

                {/* Uploaded Verification Image */}
                {currentComplaint.images && currentComplaint.images.length > 0 && (
                  <Card className="p-6 space-y-4">
                    <h3 className="font-heading text-md font-bold text-white">Visual Proof</h3>
                    <div className="relative h-44 w-full rounded-lg overflow-hidden border border-white/5 bg-zinc-950 flex items-center justify-center text-zinc-500 text-xs">
                      {/* Using simple placeholder display for mockup demo */}
                      <span className="absolute z-10 px-2 py-1 rounded bg-black/60 font-mono text-[10px] text-emerald-400 border border-emerald-500/20">
                        AI VERIFIED SIGNATURE
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent z-[5]" />
                      <div className="h-full w-full bg-zinc-900 flex items-center justify-center">
                        <Lock className="h-8 w-8 text-zinc-700" />
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AI DRAFT LETTER */}
          {activeTab === 'letter' && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  <span>Draft Review</span>
                </h3>
                <Badge variant="outline" className="uppercase font-mono text-[10px]">
                  Language: {currentComplaint.language || 'en'}
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                This formal copy is automatically generated and indexed for communication to department heads.
              </p>
              <div className="bg-zinc-950 border border-white/5 rounded-xl p-6 font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {currentComplaint.generatedLetter || 'Official drafted copy not generated yet.'}
              </div>
            </Card>
          )}

          {/* TAB 3: BLOCKCHAIN AUDIT TRAIL */}
          {activeTab === 'blockchain' && (
            <div className="space-y-6">
              <Card className="p-6 bg-gradient-to-r from-emerald-950/10 to-indigo-950/10 border-emerald-500/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <ShieldCheck className="h-5.5 w-5.5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-white">Cryptographic Audit Chain</h3>
                    <p className="text-zinc-400 text-xs mt-0.5">
                      Timelines are secured using hash blocks linked in a chain. Any tampering invalidates the verification.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Blocks */}
              <div className="relative pl-6 border-l border-white/5 space-y-6 ml-4">
                {auditTrail.map((block) => (
                  <div key={block.index} className="relative">
                    {/* Bullet marker */}
                    <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-zinc-950 border-2 border-emerald-500 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </div>

                    <Card className="p-4 space-y-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                            BLOCK #{block.index}
                          </span>
                          <h4 className="font-heading text-sm font-bold text-white uppercase">
                            {block.action.replace('_', ' ')}
                          </h4>
                        </div>
                        <span className="text-zinc-500 text-xs">{formatDateTime(block.timestamp)}</span>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {block.description}
                      </p>

                      <div className="pt-2 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
                        <div>
                          <span className="text-zinc-600 block">Block Hash</span>
                          <span className="text-zinc-400 truncate block select-all">{block.hash}</span>
                        </div>
                        <div>
                          <span className="text-zinc-600 block">Previous Hash</span>
                          <span className="text-zinc-400 truncate block select-all">{block.previousHash}</span>
                        </div>
                      </div>

                      {block.verified && (
                        <div className="flex items-center space-x-1.5 pt-1 text-[10px] font-semibold text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Ledger Authenticity Verified</span>
                        </div>
                      )}
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
