'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuthStore } from '@/store/authStore';
import { useComplaintStore } from '@/store/complaintStore';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { showToast } from '@/components/ui/Toast';
import { Loader } from '@/components/ui/Loader';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';
import VoiceRecorder from '@/components/complaints/VoiceRecorder';
import ImageUploader from '@/components/complaints/ImageUploader';

const LocationPicker = dynamic(() => import('@/components/complaints/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full rounded-xl bg-zinc-950/50 border border-white/5 animate-pulse flex items-center justify-center text-zinc-500 text-xs">
      Loading Map Canvas...
    </div>
  )
});
import {
  FileText,
  MapPin,
  Camera,
  CheckCircle,
  Brain,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Send,
  Languages
} from 'lucide-react';

export default function FileComplaintPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const { createComplaint, submitLoading } = useComplaintStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (initialized && !user) {
      router.push('/auth/login');
    }
  }, [initialized, user, router]);

  // Form states
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [priority, setPriority] = useState('MEDIUM');
  const [language, setLanguage] = useState('en');
  
  // Location states
  const [location, setLocation] = useState<{
    latitude?: number;
    longitude?: number;
    address: string;
    ward?: string;
    municipality?: string;
    district?: string;
    state?: string;
  }>({ address: '' });

  // Image states
  const [imageName, setImageName] = useState<string | null>(null);
  
  // AI analysis states
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [generatedLetter, setGeneratedLetter] = useState('');

  if (!initialized || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  const handleAIAnalyze = async () => {
    if (!description || !title) {
      showToast.warning('Please enter a title and description first');
      return;
    }

    setAiAnalyzing(true);
    try {
      // 1. Detect department, priority, category
      const analysis = await api.post('/ai/detect-department', { description, title });
      setAiResult(analysis);
      setCategory(analysis.category || 'OTHER');
      setPriority(analysis.priority || 'MEDIUM');
      showToast.success('AI classification completed!');

      // 2. Draft complaint letter
      const draft = await api.post('/ai/generate-complaint', {
        title,
        description,
        category: analysis.category,
        priority: analysis.priority,
        language,
        address: location.address,
        municipality: location.municipality,
        district: location.district,
        state: location.state,
      });
      setGeneratedLetter(draft.letter);
    } catch (err: any) {
      console.error(err);
      // Fallback templates for offline/simulation mode
      const mockCategory = description.toLowerCase().includes('pothole')
        ? 'POTHOLE'
        : description.toLowerCase().includes('garbage')
        ? 'GARBAGE'
        : 'OTHER';
      const mockPriority = description.toLowerCase().includes('emergency') || description.toLowerCase().includes('accident')
        ? 'EMERGENCY'
        : 'MEDIUM';
      
      setCategory(mockCategory);
      setPriority(mockPriority);
      
      const simulatedLetter = `To,\nThe Commissioner,\nMunicipal Corporation,\n\nSubject: Official Grievance regarding ${title || 'Civic Issue'}\n\nPriority: ${mockPriority}\nCategory: ${mockCategory}\nLocation: ${location.address || 'Not specified'}\n\nDescription:\n${description}\n\nThis grievance is officially drafted and cataloged using the AI Civic Navigator Platform.\n\nSincerely,\n${user.name}\nEmail: ${user.email}`;
      
      setGeneratedLetter(simulatedLetter);
      showToast.info('Visual simulation drafted formal grievance.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!title || !description) {
        showToast.warning('Please enter a title and description');
        return;
      }
      // Trigger AI analysis automatically if not done yet
      if (!generatedLetter) {
        handleAIAnalyze();
      }
    }
    if (step === 2) {
      if (!location.address) {
        showToast.warning('Please pick or search for a location');
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('priority', priority);
      formData.append('language', language);
      formData.append('address', location.address);
      if (location.latitude) formData.append('latitude', location.latitude.toString());
      if (location.longitude) formData.append('longitude', location.longitude.toString());
      if (location.ward) formData.append('ward', location.ward);
      if (location.municipality) formData.append('municipality', location.municipality);
      if (location.district) formData.append('district', location.district);
      if (location.state) formData.append('state', location.state);
      if (imageName) formData.append('imagePath', imageName);
      if (generatedLetter) formData.append('generatedLetter', generatedLetter);

      // We'll call the raw api object rather than Zustand upload, to match payload structure
      const response = await api.post('/complaints', {
        title,
        description,
        category,
        priority,
        language,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        ward: location.ward,
        municipality: location.municipality,
        district: location.district,
        state: location.state,
        imagePath: imageName,
        generatedLetter
      });

      showToast.success('Complaint lodged and verified on blockchain ledger!');
      router.push(`/complaints/${response.complaint?.id || response.complaint?.uuid || 'track'}`);
    } catch (err: any) {
      showToast.error(err.message || 'Failed to lodge complaint');
    }
  };

  // Progress Bar Width
  const progressPercent = (step / 4) * 100;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white">Lodge a Grievance</h1>
          <p className="text-zinc-400 text-xs mt-1">AI-powered civic resolution, validation, and transparent audit trails.</p>
        </div>

        {/* Wizard Steps indicator */}
        <div className="space-y-4">
          {/* Desktop step indicators */}
          <div className="hidden sm:flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-widest px-1">
            <span className={step >= 1 ? 'text-indigo-400' : ''}>1. Description</span>
            <span className={step >= 2 ? 'text-indigo-400' : ''}>2. Location</span>
            <span className={step >= 3 ? 'text-indigo-400' : ''}>3. Visual Proof</span>
            <span className={step >= 4 ? 'text-indigo-400' : ''}>4. Audit & Send</span>
          </div>

          {/* Mobile step indicator */}
          <div className="block sm:hidden text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Step {step} of 4: {' '}
            <span className="text-indigo-400 font-bold">
              {step === 1 ? 'Description' : step === 2 ? 'Location' : step === 3 ? 'Visual Proof' : 'Audit & Send'}
            </span>
          </div>

          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step Cards */}
        <Card className="p-6">
          {/* STEP 1: DESCRIPTION */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  <span>Grievance Details</span>
                </h2>
                
                {/* Language Picker */}
                <div className="flex items-center space-x-2 border border-white/5 bg-zinc-900/50 rounded-lg px-2 py-1">
                  <Languages className="h-4 w-4 text-zinc-400" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-transparent border-0 outline-none text-xs font-medium text-zinc-300 cursor-pointer"
                  >
                    <option value="en" className="bg-zinc-950">English</option>
                    <option value="ta" className="bg-zinc-950">தமிழ் (Tamil)</option>
                    <option value="hi" className="bg-zinc-950">हिन्दी (Hindi)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Grievance Title"
                  placeholder="e.g. Broken streetlight on 4th Main Road"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <Textarea
                  label="Detailed Description"
                  placeholder="Describe the issue, how long it has been unresolved, and any immediate public hazard..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  required
                />
              </div>

              {/* Dictation */}
              <VoiceRecorder onTranscriptChange={(text) => setDescription((prev) => (prev ? prev + ' ' + text : text))} />

              {/* Trigger analysis manually if wanted */}
              {(title && description) && (
                <div className="pt-2 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAIAnalyze}
                    loading={aiAnalyzing}
                    className="gap-2 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/5 font-semibold"
                  >
                    <Brain className="h-4 w-4" />
                    <span>Run AI Classification</span>
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: LOCATION */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-400" />
                <span>Geographic Mapping</span>
              </h2>
              <LocationPicker
                onLocationSelect={(loc) => setLocation(loc)}
                initialLocation={location.latitude ? {
                  latitude: location.latitude,
                  longitude: location.longitude!,
                  address: location.address
                } : undefined}
              />
            </div>
          )}

          {/* STEP 3: IMAGE VERIFICATION */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
                <Camera className="h-5 w-5 text-indigo-400" />
                <span>Visual Verification</span>
              </h2>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Add an image of the concern. Our AI processes the image to confirm the event exists and match it against existing tickets to avoid spam.
              </p>
              <ImageUploader
                onImageUploaded={(path, results) => {
                  setImageName(path);
                  if (results.category) {
                    setCategory(results.category);
                  }
                }}
                onImageRemoved={() => setImageName(null)}
              />
            </div>
          )}

          {/* STEP 4: REVIEW & Block chain verification */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-indigo-400" />
                <span>Audit & Verification</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-zinc-900/40">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">AI Identified Category</span>
                  <p className="text-sm font-bold text-white mt-1 uppercase">{category.replace('_', ' ')}</p>
                </Card>
                <Card className="p-4 bg-zinc-900/40">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Assigned Department</span>
                  <p className="text-sm font-bold text-indigo-400 mt-1">
                    {aiResult?.department || 'Municipal Works'}
                  </p>
                </Card>
                <Card className="p-4 bg-zinc-900/40">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Priority Routing</span>
                  <p className="text-sm font-bold text-red-400 mt-1 uppercase">{priority}</p>
                </Card>
              </div>

              {/* Draft letter display */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  AI Generated Complaint Letter
                </label>
                <div className="bg-zinc-950/80 border border-white/5 rounded-xl p-4.5 font-mono text-xs text-zinc-300 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                  {generatedLetter || 'Generating official drafted letter...'}
                </div>
              </div>
            </div>
          )}

          {/* Controls Footer */}
          <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-8">
            {step > 1 ? (
              <Button variant="outline" onClick={handlePrev} className="gap-1.5 font-semibold">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button onClick={handleNext} className="gap-1.5 font-semibold">
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={submitLoading} className="gap-2 font-semibold">
                <span>Lodge & Verify</span>
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
