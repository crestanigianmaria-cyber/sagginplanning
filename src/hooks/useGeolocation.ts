'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface UseGeolocationReturn {
  position: GeolocationPosition | null;
  error: string | null;
  isTracking: boolean;
  isSupported: boolean;
  getCurrentPosition: () => Promise<GeolocationPosition>;
  startTracking: (intervalMs?: number) => void;
  stopTracking: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const isSupported = typeof window !== 'undefined' && 'geolocation' in navigator;
  
  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!isSupported) {
        const err = 'Geolocalizzazione non supportata dal dispositivo';
        setError(err);
        reject(new Error(err));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const geoPos: GeolocationPosition = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          };
          setPosition(geoPos);
          setError(null);
          resolve(geoPos);
        },
        (err) => {
          let message = 'Errore di geolocalizzazione';
          switch (err.code) {
            case err.PERMISSION_DENIED:
              message = 'Permesso di geolocalizzazione negato. Abilitalo nelle impostazioni.';
              break;
            case err.POSITION_UNAVAILABLE:
              message = 'Posizione non disponibile';
              break;
            case err.TIMEOUT:
              message = 'Timeout nel recupero della posizione';
              break;
          }
          setError(message);
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });
  }, [isSupported]);
  
  const startTracking = useCallback((intervalMs: number = 30000) => {
    if (!isSupported) return;
    
    setIsTracking(true);
    
    // Use watchPosition for continuous updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setError(null);
      },
      (err) => {
        setError(`Errore GPS: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: intervalMs,
      }
    );
  }, [isSupported]);
  
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  return {
    position,
    error,
    isTracking,
    isSupported,
    getCurrentPosition,
    startTracking,
    stopTracking,
  };
}
