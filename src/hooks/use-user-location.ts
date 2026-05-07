'use client';

import { useCallback, useEffect, useState } from 'react';

export type ClientLocationPayload = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

/**
 * Browser geolocation for NLP + localized assistant context.
 * User must grant permission; failures are non-fatal.
 */
export function useUserLocation() {
  const [location, setLocation] = useState<ClientLocationPayload | null>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'granted' | 'denied' | 'unsupported'>('idle');
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setStatus('unsupported');
      setError('Geolocation not supported');
      return;
    }
    setStatus('pending');
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setStatus('granted');
        setError(null);
      },
      (err) => {
        setStatus('denied');
        setError(err.message);
        setLocation(null);
      },
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 120_000 }
    );
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { location, status, error, refresh };
}
