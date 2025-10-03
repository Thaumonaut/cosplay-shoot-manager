import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Shoot, Location } from "@shared/schema";
import { GoogleMap } from "@/components/GoogleMap";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { MapPin, Calendar, Users, Camera, Package, Palette, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShootWithLocation extends Shoot {
  location?: Location;
}

const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };
const DEFAULT_ZOOM = 10;

export default function MapView() {
  const [selectedShootId, setSelectedShootId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const accordionRef = useRef<HTMLDivElement>(null);

  const {
    data: shoots = [],
    isLoading: isLoadingShoots,
  } = useQuery<Shoot[]>({
    queryKey: ["/api/shoots"],
  });

  const {
    data: locations = [],
    isLoading: isLoadingLocations,
  } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const isLoading = isLoadingShoots || isLoadingLocations;

  const shootsWithLocations: ShootWithLocation[] = shoots.map((shoot) => {
    const location = shoot.locationId
      ? locations.find((loc) => loc.id === shoot.locationId)
      : undefined;
    return {
      ...shoot,
      location,
    };
  });

  const shootsWithValidLocations = shootsWithLocations.filter(
    (shoot) =>
      shoot.location &&
      shoot.location.placeId &&
      shoot.location.latitude !== null &&
      shoot.location.longitude !== null
  );

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setMapZoom(12);
        },
        (error) => {
          console.log("Geolocation denied or unavailable, using shoot locations");
          if (shootsWithValidLocations.length > 0) {
            const avgLat =
              shootsWithValidLocations.reduce(
                (sum, shoot) => sum + (shoot.location!.latitude || 0),
                0
              ) / shootsWithValidLocations.length;

            const avgLng =
              shootsWithValidLocations.reduce(
                (sum, shoot) => sum + (shoot.location!.longitude || 0),
                0
              ) / shootsWithValidLocations.length;

            setMapCenter({ lat: avgLat, lng: avgLng });
          }
        },
        {
          timeout: 5000,
          maximumAge: 300000,
        }
      );
    } else if (shootsWithValidLocations.length > 0) {
      const avgLat =
        shootsWithValidLocations.reduce(
          (sum, shoot) => sum + (shoot.location!.latitude || 0),
          0
        ) / shootsWithValidLocations.length;

      const avgLng =
        shootsWithValidLocations.reduce(
          (sum, shoot) => sum + (shoot.location!.longitude || 0),
          0
        ) / shootsWithValidLocations.length;

      setMapCenter({ lat: avgLat, lng: avgLng });
    }
  }, [shootsWithValidLocations.length]);

  const markers = shootsWithValidLocations.map((shoot) => ({
    id: shoot.id,
    position: {
      lat: shoot.location!.latitude!,
      lng: shoot.location!.longitude!,
    },
    title: shoot.title,
    onClick: () => {
      setSelectedShootId(shoot.id);
      
      setTimeout(() => {
        const element = document.getElementById(`accordion-item-${shoot.id}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 100);
    },
  }));

  const handleAccordionClick = (shootId: string) => {
    const shoot = shootsWithValidLocations.find((s) => s.id === shootId);
    if (shoot && shoot.location) {
      setMapCenter({
        lat: shoot.location.latitude!,
        lng: shoot.location.longitude!,
      });
      setMapZoom(15);
      setSelectedShootId(shootId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Map View</h1>
          <p className="text-muted-foreground mt-2">
            View all your shoots on a map
          </p>
        </div>
        <Skeleton className="h-[500px] w-full rounded-lg" data-testid="skeleton-map" />
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" data-testid="skeleton-accordion-1" />
          <Skeleton className="h-20 w-full" data-testid="skeleton-accordion-2" />
          <Skeleton className="h-20 w-full" data-testid="skeleton-accordion-3" />
        </div>
      </div>
    );
  }

  if (shootsWithValidLocations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="title-map-view">Map View</h1>
          <p className="text-muted-foreground mt-2" data-testid="subtitle-map-view">
            View all your shoots on a map
          </p>
        </div>
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <MapPin className="h-16 w-16 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2" data-testid="text-no-locations-title">
                No shoots with locations yet
              </h2>
              <p className="text-muted-foreground" data-testid="text-no-locations-subtitle">
                Add locations to your shoots to see them on the map
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="title-map-view">Map View</h1>
        <p className="text-muted-foreground mt-2" data-testid="subtitle-map-view">
          View all your shoots on a map
        </p>
      </div>

      <GoogleMap
        center={mapCenter}
        zoom={mapZoom}
        markers={markers}
        className="h-[500px]"
      />

      <div className="space-y-4" ref={accordionRef}>
        <h2 className="text-xl font-semibold" data-testid="title-shoots-list">
          All Shoots ({shootsWithLocations.length})
        </h2>
        
        <Accordion
          type="single"
          collapsible
          value={selectedShootId || undefined}
          onValueChange={(value) => setSelectedShootId(value || null)}
          data-testid="accordion-shoots"
        >
          {shootsWithLocations.map((shoot) => (
            <AccordionItem
              key={shoot.id}
              value={shoot.id}
              id={`accordion-item-${shoot.id}`}
              className={cn(
                "border rounded-lg mb-3 px-4 transition-colors",
                selectedShootId === shoot.id && "bg-accent/50"
              )}
              data-testid={`accordion-item-${shoot.id}`}
            >
              <AccordionTrigger
                className="hover:no-underline"
                onClick={() => {
                  if (shoot.location?.latitude !== null && shoot.location?.latitude !== undefined && shoot.location?.longitude !== null && shoot.location?.longitude !== undefined) {
                    handleAccordionClick(shoot.id);
                  }
                }}
                data-testid={`accordion-trigger-${shoot.id}`}
              >
                <div className="flex items-start gap-4 flex-1 text-left pr-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3
                        className="font-semibold text-base"
                        data-testid={`text-shoot-title-${shoot.id}`}
                      >
                        {shoot.title}
                      </h3>
                      <StatusBadge
                        status={shoot.status as any}
                        data-testid={`badge-status-${shoot.id}`}
                      />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      {shoot.date && (
                        <div
                          className="flex items-center gap-1.5"
                          data-testid={`text-date-${shoot.id}`}
                        >
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(shoot.date), "MMM d, yyyy")}
                          </span>
                        </div>
                      )}
                      {shoot.location ? (
                        <div
                          className="flex items-center gap-1.5"
                          data-testid={`text-location-${shoot.id}`}
                        >
                          <MapPin className="h-4 w-4" />
                          <span>{shoot.location.name}</span>
                        </div>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs"
                          data-testid={`badge-no-location-${shoot.id}`}
                        >
                          No location
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent data-testid={`accordion-content-${shoot.id}`}>
                <ShootDetails shoot={shoot} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

function ShootDetails({ shoot }: { shoot: ShootWithLocation }) {
  const { data: costumes = [] } = useQuery({
    queryKey: ["/api/shoots", shoot.id, "costumes"],
    queryFn: async () => {
      const res = await fetch(`/api/shoots/${shoot.id}/costumes`);
      if (!res.ok) throw new Error("Failed to fetch costumes");
      return res.json();
    },
  });

  const { data: props = [] } = useQuery({
    queryKey: ["/api/shoots", shoot.id, "props"],
    queryFn: async () => {
      const res = await fetch(`/api/shoots/${shoot.id}/props`);
      if (!res.ok) throw new Error("Failed to fetch props");
      return res.json();
    },
  });

  const { data: participants = [] } = useQuery({
    queryKey: ["/api/shoots", shoot.id, "participants"],
    queryFn: async () => {
      const res = await fetch(`/api/shoots/${shoot.id}/participants`);
      if (!res.ok) throw new Error("Failed to fetch participants");
      return res.json();
    },
  });

  return (
    <div className="pt-4 space-y-6">
      {shoot.description && (
        <div data-testid={`section-description-${shoot.id}`}>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-sm">Description</h4>
          </div>
          <p className="text-sm text-muted-foreground pl-6" data-testid={`text-description-${shoot.id}`}>
            {shoot.description}
          </p>
        </div>
      )}

      {costumes.length > 0 && (
        <div data-testid={`section-costumes-${shoot.id}`}>
          <div className="flex items-center gap-2 mb-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-sm">Costumes</h4>
          </div>
          <div className="flex flex-wrap gap-2 pl-6">
            {costumes.map((costume: any) => (
              <Badge
                key={costume.id}
                variant="secondary"
                data-testid={`badge-costume-${costume.id}`}
              >
                {costume.characterName || costume.character_name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {props.length > 0 && (
        <div data-testid={`section-props-${shoot.id}`}>
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-sm">Props</h4>
          </div>
          <div className="flex flex-wrap gap-2 pl-6">
            {props.map((prop: any) => (
              <Badge
                key={prop.id}
                variant="secondary"
                data-testid={`badge-prop-${prop.id}`}
              >
                {prop.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {participants.length > 0 && (
        <div data-testid={`section-participants-${shoot.id}`}>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-sm">Personnel</h4>
          </div>
          <div className="space-y-2 pl-6">
            {participants.map((participant: any) => (
              <div
                key={participant.id}
                className="flex items-center gap-2 text-sm"
                data-testid={`item-participant-${participant.id}`}
              >
                <span className="font-medium">{participant.name}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{participant.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {shoot.notes && (
        <div data-testid={`section-notes-${shoot.id}`}>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-sm">Notes</h4>
          </div>
          <p className="text-sm text-muted-foreground pl-6 whitespace-pre-wrap" data-testid={`text-notes-${shoot.id}`}>
            {shoot.notes}
          </p>
        </div>
      )}

      {!shoot.description &&
        costumes.length === 0 &&
        props.length === 0 &&
        participants.length === 0 &&
        !shoot.notes && (
          <p className="text-sm text-muted-foreground italic" data-testid={`text-no-details-${shoot.id}`}>
            No additional details for this shoot
          </p>
        )}
    </div>
  );
}
