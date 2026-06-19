'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { api } from '@/lib/api';
import { Map, Filter, AlertTriangle, ShieldCheck } from 'lucide-react';

// Dynamic imports for map to prevent SSR errors
const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then((m) => m.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((m) => m.Popup),
  { ssr: false }
);

export default function HeatmapPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    if (initialized && !user) {
      router.push('/auth/login');
    }
  }, [initialized, user, router]);

  // Load Leaflet in browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then((leaflet) => {
        setL(leaflet);
      });
    }
  }, []);

  useEffect(() => {
    async function fetchHeatmap() {
      if (user) {
        setLoading(true);
        try {
          const data = await api.get('/analytics/heatmap');
          setHeatmapData(data || []);
        } catch (err) {
          console.error('Failed to load heatmap coords', err);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchHeatmap();
  }, [user]);

  if (!initialized || !user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col min-h-[calc(100vh-140px)] lg:h-[calc(100vh-140px)] space-y-4">
        {/* Header Toolbar */}
        <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/20 to-cyan-950/20 border-indigo-500/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Map className="h-5.5 w-5.5 text-indigo-400" />
            </div>
            <div>
              <h1 className="font-heading text-base font-bold text-white flex items-center gap-1.5">
                <span>Civic Grievance Heatmap</span>
              </h1>
              <p className="text-zinc-500 text-xs">Visualize density and intensity of active grievances across municipality divisions.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span>Real-time Density Feeds</span>
          </div>
        </Card>

        {/* Heatmap Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 h-auto lg:h-full lg:overflow-hidden">
          {/* Map Viewer */}
          <div className="h-[350px] lg:h-full lg:col-span-3 rounded-xl overflow-hidden border border-white/5 bg-zinc-950 relative">
            {L ? (
              <MapContainer
                center={[13.0827, 80.2707]} // Default Chennai center
                zoom={12}
                scrollWheelZoom={true}
                className="h-full w-full z-10"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Render circles representing heatmap points */}
                {heatmapData.map((point, index) => (
                  <CircleMarker
                    key={index}
                    center={[point.lat, point.lng]}
                    radius={Math.min(25, 8 + point.weight / 3)}
                    fillColor={point.weight > 35 ? '#ef4444' : point.weight > 25 ? '#f59e0b' : '#3b82f6'}
                    color="transparent"
                    fillOpacity={0.55}
                  >
                    <Popup>
                      <div className="space-y-1 p-1">
                        <p className="font-heading text-xs font-bold text-white">{point.area}</p>
                        <p className="text-[10px] text-zinc-400">Density Weight: {point.weight} cases</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-xs">
                Rendering Map Canvas...
              </div>
            )}
          </div>

          {/* Sidebar Metrics */}
          <Card className="p-5 flex flex-col space-y-4 h-[400px] lg:h-full overflow-y-auto">
            <h3 className="font-heading text-sm font-bold text-white flex items-center gap-1.5">
              <Filter className="h-4.5 w-4.5 text-indigo-400" />
              <span>Division Density</span>
            </h3>

            <div className="space-y-3 flex-1">
              {heatmapData.slice(0, 6).map((point, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-white/5 bg-zinc-900/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200 truncate pr-2 max-w-[120px]">
                      {point.area}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      point.weight > 35
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {point.weight} Cases
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${point.weight > 35 ? 'bg-red-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, (point.weight / 50) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg border border-white/5 bg-zinc-900/10 flex items-start gap-2.5">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed text-zinc-500">
                Potholes and sanitation issues make up 65% of hot spot clusters this week.
              </p>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
