import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2 } from "lucide-react";

interface MapboxLocationSearchProps {
  onLocationSelect: (location: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
  placeholder?: string;
  label?: string;
  initialValue?: string;
}

interface MapboxFeature {
  properties: {
    name?: string;
    full_address?: string;
    name_preferred?: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  geometry: {
    coordinates: [number, number];
  };
}

export function MapboxLocationSearch({
  onLocationSelect,
  placeholder = "Search for a location...",
  label,
  initialValue = "",
}: MapboxLocationSearchProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchLocations = async () => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);

      try {
        // Use backend proxy to avoid exposing API key
        const response = await fetch(`/api/mapbox/geocode?q=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();
        setSuggestions(data.features || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchLocations, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (feature: MapboxFeature) => {
    const name = feature.properties.name_preferred || feature.properties.name || "";
    const address = feature.properties.full_address || "";
    const latitude = feature.properties.coordinates?.latitude || feature.geometry.coordinates[1];
    const longitude = feature.properties.coordinates?.longitude || feature.geometry.coordinates[0];

    setQuery(name || address);
    setShowSuggestions(false);
    setSuggestions([]);

    onLocationSelect({
      name,
      address,
      latitude,
      longitude,
    });
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && <Label>{label}</Label>}
      <div className="relative">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder}
            className="pl-9"
            data-testid="input-location-search"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((feature, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(feature)}
                className="w-full text-left px-4 py-2 hover-elevate flex items-start gap-2 border-b last:border-b-0"
                data-testid={`suggestion-${index}`}
              >
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {feature.properties.name_preferred || feature.properties.name}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {feature.properties.full_address}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
