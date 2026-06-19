import { useState, useCallback } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  ward?: string;
  municipality?: string;
  district?: string;
  state?: string;
}

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);

  const getAddressFromCoords = async (lat: number, lng: number): Promise<Partial<LocationData>> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      if (!response.ok) throw new Error('Geocoding failed');
      const data = await response.json();
      
      const addr = data.address || {};
      const state = addr.state || '';
      const district = addr.county || addr.district || addr.city_district || '';
      const municipality = addr.city || addr.town || addr.suburb || addr.village || '';
      const ward = addr.suburb || addr.neighbourhood || '';
      const address = data.display_name || `${lat}, ${lng}`;

      return {
        address,
        ward,
        municipality,
        district,
        state,
      };
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      return {
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      };
    }
  };

  const getCurrentLocation = useCallback((): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const errorMsg = 'Geolocation is not supported by your browser';
        setError(errorMsg);
        reject(new Error(errorMsg));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const addressData = await getAddressFromCoords(latitude, longitude);
            const fullLocation: LocationData = {
              latitude,
              longitude,
              address: addressData.address || `${latitude}, ${longitude}`,
              ward: addressData.ward,
              municipality: addressData.municipality,
              district: addressData.district,
              state: addressData.state,
            };
            setLocation(fullLocation);
            setLoading(false);
            resolve(fullLocation);
          } catch (err: any) {
            const loc: LocationData = {
              latitude,
              longitude,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            };
            setLocation(loc);
            setLoading(false);
            resolve(loc);
          }
        },
        (err) => {
          let errorMsg = 'Failed to get location';
          if (err.code === 1) errorMsg = 'Location permission denied by user';
          else if (err.code === 2) errorMsg = 'Location position unavailable';
          else if (err.code === 3) errorMsg = 'Location timeout';
          
          setError(errorMsg);
          setLoading(false);
          reject(new Error(errorMsg));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    setLocation,
  };
}
