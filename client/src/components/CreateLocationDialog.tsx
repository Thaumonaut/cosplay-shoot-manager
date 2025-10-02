import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { GoogleMapsLocationSearch } from "@/components/GoogleMapsLocationSearch";
import { InlineEdit } from "@/components/InlineEdit";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import type { Location } from "@shared/schema";

interface CreateLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (location: any) => void;
  editItem?: Location;
}

export function CreateLocationDialog({
  open,
  onOpenChange,
  onSuccess,
  editItem,
}: CreateLocationDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editItem) {
      setName(editItem.name || "");
      setAddress(editItem.address || "");
      setPlaceId(editItem.placeId || "");
      setNotes(editItem.notes || "");
    }
  }, [editItem]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/locations", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create location");
      }
      return await response.json();
    },
    onSuccess: (newLocation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      toast({
        title: "Success",
        description: "Location added successfully",
      });
      resetForm();
      onOpenChange(false);
      onSuccess?.(newLocation);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create location",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/locations/${editItem!.id}`, {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to update location");
      }
      return await response.json();
    },
    onSuccess: (updatedLocation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/locations", editItem!.id] });
      toast({
        title: "Success",
        description: "Location updated successfully",
      });
      resetForm();
      onOpenChange(false);
      onSuccess?.(updatedLocation);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update location",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setAddress("");
    setPlaceId("");
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    const data: any = {
      name: name.trim(),
    };

    if (address.trim()) {
      data.address = address.trim();
    }
    if (placeId.trim()) {
      data.placeId = placeId.trim();
    }
    if (notes.trim()) {
      data.notes = notes.trim();
    }

    if (editItem) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleLocationSelect = (location: {
    name: string;
    address: string;
    placeId: string;
    latitude: number;
    longitude: number;
  }) => {
    setName(location.name || location.address.split(",")[0]);
    setAddress(location.address);
    setPlaceId(location.placeId);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent data-testid="dialog-create-location">
        <DialogHeader>
          <DialogTitle>{editItem ? "Edit Location" : "Add New Location"}</DialogTitle>
          <DialogDescription>
            {editItem ? "Update location details" : "Search for a location using Google Maps"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {editItem && editItem.placeId && (
            <Card>
              <CardContent className="p-0">
                <iframe
                  src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=place_id:${editItem.placeId}`}
                  className="w-full h-[200px] border-0 rounded-md"
                  frameBorder="0"
                  allowFullScreen
                  loading="lazy"
                  data-testid="map-embed"
                />
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label>Search for Location</Label>
            <GoogleMapsLocationSearch
              onLocationSelect={handleLocationSelect}
              placeholder="Search for a location..."
            />
          </div>

          {placeId && (
            <Card className="bg-muted/50">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">Location Selected</div>
                    <div className="text-sm text-muted-foreground truncate mt-1">
                      {address}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <InlineEdit
              value={name}
              onChange={setName}
              placeholder="e.g., Central Park"
              type="text"
              data-testid="input-location-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <InlineEdit
              value={address}
              onChange={setAddress}
              placeholder="123 Main St, New York, NY 10001"
              type="text"
              data-testid="input-location-address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              data-testid="input-location-notes"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save"
            >
              {editItem
                ? (updateMutation.isPending ? "Updating..." : "Update")
                : (createMutation.isPending ? "Creating..." : "Create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
