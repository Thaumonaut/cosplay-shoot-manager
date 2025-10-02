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

interface PlacePrediction {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export function MapboxLocationSearch({
  onLocationSelect,
  placeholder = "Search for a location...",
  label,
  initialValue = "",
}: MapboxLocationSearchProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchLocations = async () => {
      if (query.length < 3) {
        setSuggestions([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Use backend proxy to avoid exposing API key
        const response = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        // Check for errors in the response
        if (data.error || !Array.isArray(data.predictions)) {
          const errorMessage = data.error || "Unable to fetch locations";
          console.error("Location service error:", errorMessage);
          setError(errorMessage);
          setSuggestions([]);
          setShowSuggestions(false);
        } else {
          setError(null);
          setSuggestions(data.predictions);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
        setError("Failed to fetch locations. Please try again.");
        setSuggestions([]);
        setShowSuggestions(false);
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

  const handleSelect = (prediction: PlacePrediction) => {
    setQuery(prediction.name || prediction.address);
    setShowSuggestions(false);
    setSuggestions([]);

    onLocationSelect({
      name: prediction.name,
      address: prediction.address,
      latitude: prediction.latitude,
      longitude: prediction.longitude,
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

        {error && query.length >= 3 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-destructive/50 rounded-md shadow-lg px-4 py-3">
            <p className="text-sm text-destructive" data-testid="location-error">{error}</p>
          </div>
        )}

        {showSuggestions && suggestions.length > 0 && !error && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((prediction, index) => (
              <button
                key={prediction.placeId || index}
                type="button"
                onClick={() => handleSelect(prediction)}
                className="w-full text-left px-4 py-2 hover-elevate flex items-start gap-2 border-b last:border-b-0"
                data-testid={`suggestion-${index}`}
              >
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {prediction.name}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {prediction.address}
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
