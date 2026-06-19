'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { MapPin, Navigation, Search } from 'lucide-react';

interface LocationPickerProps {
  onLocationSelect: (loc: {
    latitude: number;
    longitude: number;
    address: string;
    ward?: string;
    municipality?: string;
    district?: string;
    state?: string;
  }) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

function MapEventsHelper({
  onMapClick,
  onMapLoad,
}: {
  onMapClick: (lat: number, lng: number) => void;
  onMapLoad: (map: any) => void;
}) {
  const map = useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (map) {
      onMapLoad(map);
    }
  }, [map, onMapLoad]);

  return null;
}

export default function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const { getCurrentLocation, loading: geoLoading, error: geoError } = useGeolocation();
  const [position, setPosition] = useState<[number, number]>([13.0827, 80.2707]); // Default Chennai
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [L, setL] = useState<any>(null);

  // Load leaflet icons in browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then((leaflet) => {
        setL(leaflet);
        // Fix marker icons path
        delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
      });
    }
  }, []);

  // Set initial position if provided
  useEffect(() => {
    if (initialLocation) {
      setPosition([initialLocation.latitude, initialLocation.longitude]);
      setAddress(initialLocation.address);
    }
  }, [initialLocation]);

  const updateLocation = async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    if (mapInstance) {
      mapInstance.setView([lat, lng], 15);
    }
    
    // Reverse geocode
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      const addr = data.address || {};
      const displayAddress = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      
      setAddress(displayAddress);

      onLocationSelect({
        latitude: lat,
        longitude: lng,
        address: displayAddress,
        ward: addr.suburb || addr.neighbourhood,
        municipality: addr.city || addr.town || addr.suburb || addr.village,
        district: addr.county || addr.district || addr.city_district,
        state: addr.state,
      });
    } catch (err) {
      const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(fallbackAddress);
      onLocationSelect({
        latitude: lat,
        longitude: lng,
        address: fallbackAddress,
      });
    }
  };

  const handleGPSDetect = async () => {
    try {
      const loc = await getCurrentLocation();
      updateLocation(loc.latitude, loc.longitude);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        updateLocation(parseFloat(lat), parseFloat(lon));
      }
    } catch (err) {
      console.error('Search location error:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Geolocation Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            placeholder="Search city, neighborhood, street..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-10"
          />
          <Button type="submit" variant="outline" className="px-3">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <Button
          type="button"
          onClick={handleGPSDetect}
          loading={geoLoading}
          variant="outline"
          className="h-10 gap-2 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/5 font-semibold shrink-0"
        >
          <Navigation className="h-4 w-4" />
          <span>Locate Me</span>
        </Button>
      </div>

      {geoError && <p className="text-xs text-red-400">{geoError}</p>}

      {/* Map View */}
      <div className="relative h-72 w-full rounded-xl overflow-hidden border border-white/5 bg-zinc-950">
        {L && (
          <MapContainer
            center={position}
            zoom={13}
            scrollWheelZoom={true}
            className="h-full w-full z-10"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} />
            <MapEventsHelper
              onMapClick={updateLocation}
              onMapLoad={setMapInstance}
            />
          </MapContainer>
        )}
        {!L && (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-xs">
            Loading Map View...
          </div>
        )}
      </div>

      {/* Selected Address Display */}
      {address && (
        <Card className="p-3 bg-zinc-900/50 border border-white/5 flex items-start gap-2.5">
          <MapPin className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold text-zinc-300">Target Address</p>
            <p className="text-zinc-400 mt-0.5 leading-relaxed">{address}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
