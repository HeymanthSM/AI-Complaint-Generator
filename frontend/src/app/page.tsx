'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import {
  ShieldAlert,
  Brain,
  MessageSquare,
  FileText,
  Volume2,
  Camera,
  MapPin,
  LineChart,
  Link as LinkIcon,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';

export default function LandingPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  const stats = [
    { value: '98%', label: 'AI Accuracy' },
    { value: '45%', label: 'Faster Resolution' },
    { value: '10K+', label: 'Cases Solved' },
    { value: '100%', label: 'Audit Integrity' },
  ];

  const features = [
    {
      icon: <Brain className="h-6 w-6 text-indigo-400" />,
      title: 'AI Department Identification',
      desc: 'Automatically classifies grievance descriptions and routes them to the correct municipal department with high precision.',
    },
    {
      icon: <FileText className="h-6 w-6 text-cyan-400" />,
      title: 'Smart Complaint Generator',
      desc: 'Drafts comprehensive, formal complaint letters in English, Tamil, or Hindi to ensure maximum impact and official clarity.',
    },
    {
      icon: <Volume2 className="h-6 w-6 text-emerald-400" />,
      title: 'Voice Grievance Logging',
      desc: 'Transcribe spoken descriptions in real-time, enabling rapid hands-free reports for accessibility and convenience.',
    },
    {
      icon: <Camera className="h-6 w-6 text-pink-400" />,
      title: 'Computer Vision Analysis',
      desc: 'Scans uploaded photos (potholes, garbage, lighting) to verify claims, estimate severity, and detect duplicate submissions.',
    },
    {
      icon: <MapPin className="h-6 w-6 text-yellow-400" />,
      title: 'GPS Geolocation Routing',
      desc: 'Pins exact locations on interactive maps, automatically retrieving municipal wards, streets, and district data.',
    },
    {
      icon: <LinkIcon className="h-6 w-6 text-purple-400" />,
      title: 'Cryptographic Audit Trail',
      desc: 'Secures case timelines with SHA-256 block chains, ensuring citizen updates, allocations, and resolutions are tamper-proof.',
    },
    {
      icon: <LineChart className="h-6 w-6 text-blue-400" />,
      title: 'Civic Performance Analytics',
      desc: 'Visualizes department response times, resolution rates, hot spots, and predictive analytics on civic heatmaps.',
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-indigo-400" />,
      title: 'AI Assistant Chatbot',
      desc: 'Walks citizens through official grievance procedures, answers civic bylaws, and fetches instant status reports.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 sm:pb-24 lg:pt-32">
          {/* Neon Glow Effects */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -z-10 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[150px]" />
          <div className="absolute top-1/3 left-1/3 -translate-x-1/3 -z-10 h-[400px] w-[400px] rounded-full bg-cyan-600/10 blur-[120px]" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: -25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI-Powered Citizen Empowerment</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-heading text-4xl sm:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight"
            >
              Transforming Grievances into{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Government Action
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed"
            >
              AI Civic Navigator simplifies public issue reporting. File grievances through text, voice, and images. Our AI models analyze, draft, translate, and route reports to the responsible officials instantly.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/complaints">
                <Button size="lg" className="w-full sm:w-auto font-semibold gap-2 active:scale-95 transition-all">
                  <span>File a Grievance</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold active:scale-95 transition-all">
                  Access Portal
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-white/5 bg-zinc-950/40 backdrop-blur-sm py-12 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="font-heading text-3xl sm:text-4xl font-extrabold text-white bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid Section */}
        <section className="py-20 sm:py-28 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight text-white">
                Platform Capabilities
              </h2>
              <p className="mt-4 text-sm sm:text-base text-zinc-400">
                A state-of-the-art suite of smart tools built using advanced NLP, vision, and blockchain technologies to drive modern civic resolutions.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="h-full flex flex-col items-start p-6">
                    <CardHeader className="p-0 border-0 flex items-center justify-center h-12 w-12 rounded-xl bg-zinc-900 border border-white/5 shadow-inner mb-4">
                      {feature.icon}
                    </CardHeader>
                    <CardContent className="p-0 flex-1">
                      <CardTitle className="font-heading text-base font-bold text-white mb-2">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-xs leading-relaxed text-zinc-400">
                        {feature.desc}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA section */}
        <section className="relative py-16 sm:py-20 border-t border-white/5 bg-zinc-950/20">
          <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-t from-indigo-950/20 to-transparent" />
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="font-heading text-2xl sm:text-4xl font-bold text-white">
              Ready to report a local concern?
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Join thousands of active citizens. Keep your municipality accountable, report issues instantly, and follow the transparent resolution trail.
            </p>
            <div className="pt-4">
              <Link href="/complaints">
                <Button size="lg" className="px-8 font-semibold">
                  File Complaint Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
