/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title?: string;
    onClick?: () => void;
    id?: string;
  }>;
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

declare global {
  interface Window {
    google?: any;
    initGoogleMaps?: () => void;
  }
}

let isScriptLoading = false;
let isScriptLoaded = false;
const scriptLoadCallbacks: Array<{ resolve: () => void; reject: (error: Error) => void }> = [];

const loadGoogleMapsScript = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window.google !== 'undefined' && window.google.maps) {
      isScriptLoaded = true;
      resolve();
      return;
    }

    if (isScriptLoading) {
      scriptLoadCallbacks.push({ resolve, reject });
      return;
    }

    isScriptLoading = true;

    fetch('/api/google-maps-config')
      .then(res => res.json())
      .then(config => {
        if (!config.apiKey) {
          throw new Error('Google Maps API key not configured');
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          isScriptLoaded = true;
          isScriptLoading = false;
          resolve();
          scriptLoadCallbacks.forEach(cb => cb.resolve());
          scriptLoadCallbacks.length = 0;
        };

        script.onerror = () => {
          isScriptLoading = false;
          const error = new Error('Failed to load Google Maps script');
          reject(error);
          scriptLoadCallbacks.forEach(cb => cb.reject(error));
          scriptLoadCallbacks.length = 0;
        };

        document.head.appendChild(script);
      })
      .catch(error => {
        isScriptLoading = false;
        reject(error);
        scriptLoadCallbacks.forEach(cb => cb.reject(error));
        scriptLoadCallbacks.length = 0;
      });
  });
};

export function GoogleMap({ 
  center, 
  zoom = 15, 
  markers = [], 
  className,
  onMapClick 
}: GoogleMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await loadGoogleMapsScript();

        if (!mounted || !mapContainerRef.current) return;

        if (!window.google?.maps) {
          throw new Error('Google Maps API not loaded');
        }

        const mapOptions: google.maps.MapOptions = {
          center,
          zoom,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        };

        mapRef.current = new window.google.maps.Map(
          mapContainerRef.current,
          mapOptions
        );

        if (onMapClick && mapRef.current) {
          mapRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              onMapClick(e.latLng.lat(), e.latLng.lng());
            }
          });
        }

        setIsLoading(false);
      } catch (err) {
        if (mounted) {
          console.error('Error initializing map:', err);
          setError(err instanceof Error ? err.message : 'Failed to load map');
          setIsLoading(false);
        }
      }
    };

    initMap();

    return () => {
      mounted = false;
      if (mapRef.current) {
        window.google?.maps.event.clearInstanceListeners(mapRef.current);
      }
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return;

    mapRef.current.setCenter(center);
  }, [center]);

  useEffect(() => {
    if (!mapRef.current || zoom === undefined) return;

    mapRef.current.setZoom(zoom);
  }, [zoom]);

  useEffect(() => {
    if (!mapRef.current || !window.google?.maps || isLoading) return;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    markers.forEach((markerData) => {
      const marker = new window.google.maps.Marker({
        position: markerData.position,
        map: mapRef.current,
        title: markerData.title,
      });

      if (markerData.onClick) {
        marker.addListener('click', markerData.onClick);
      }

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [markers, isLoading]);

  if (error) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted rounded-md h-[400px]",
          className
        )}
        data-testid="map-error"
      >
        <div className="text-center p-4">
          <p className="text-sm text-destructive">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">Please check your configuration</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative h-[400px] rounded-md overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full"
        data-testid="google-map-container"
      />
    </div>
  );
}
