import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useOptionalDialog } from "@/components/ui/dialog";
import { GoogleMapsLocationSearch } from "@/components/GoogleMapsLocationSearch";
import { GoogleMap } from "@/components/GoogleMap";
import { InlineEdit } from "@/components/InlineEdit";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import type { Location } from "@shared/schema";

interface CreateLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (location: any) => void;
  onSave?: (data: any) => Promise<any> | void;
  editItem?: Location;
}

export function CreateLocationDialog({ open, onOpenChange, onSuccess, onSave, editItem }: CreateLocationDialogProps) {
  const dialog = useOptionalDialog();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [selectedLocationName, setSelectedLocationName] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editItem) {
      setName(editItem.name || "");
      setSelectedLocationName(editItem.name || "");
      setAddress(editItem.address || "");
      setPlaceId(editItem.placeId || "");
      setLatitude(editItem.latitude ?? undefined);
      setLongitude(editItem.longitude ?? undefined);
      setNotes(editItem.notes || "");
    }
  }, [editItem]);

  const resetForm = () => {
    setName("");
    setSelectedLocationName("");
    setAddress("");
    setPlaceId("");
    setLatitude(undefined);
    setLongitude(undefined);
    setNotes("");
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/locations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/locations/${editItem!.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });

  const handleLocationSelect = (loc: { name: string; address: string; placeId: string; latitude: number; longitude: number }) => {
    const locName = loc.name || loc.address.split(",")[0];
    setSelectedLocationName(locName);
    setName(locName);
    setAddress(loc.address);
    setPlaceId(loc.placeId);
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && !selectedLocationName) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }

    const data: any = { name: name.trim() || selectedLocationName };
    if (address.trim()) data.address = address.trim();
    if (placeId.trim()) data.placeId = placeId.trim();
    if (latitude !== undefined) data.latitude = latitude;
    if (longitude !== undefined) data.longitude = longitude;
    if (notes.trim()) data.notes = notes.trim();

    if (editItem) {
      updateMutation.mutate(data, {
        onSuccess: (updated) => {
          queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
          queryClient.invalidateQueries({ queryKey: ["/api/locations", editItem!.id] });
          toast({ title: "Success", description: "Location updated successfully" });
          resetForm();
          onOpenChange(false);
          onSuccess?.(updated);
          if (onSave) {
            try { void Promise.resolve(onSave(updated)); } catch (e) { console.error(e); }
          }
          if (dialog) {
            dialog.setResult(updated);
            void dialog.triggerSubmit();
          }
        },
        onError: (err: any) => {
          // eslint-disable-next-line no-console
          console.error('CreateLocationDialog update error', err);
          toast({ title: "Error", description: err?.message || "Failed to update location", variant: "destructive" });
        },
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: (newLocation) => {
          queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
          toast({ title: "Success", description: "Location added successfully" });
          resetForm();
          onOpenChange(false);
          onSuccess?.(newLocation);
          if (onSave) {
            try { void Promise.resolve(onSave(newLocation)); } catch (e) { console.error(e); }
          }
          if (dialog) {
            dialog.setResult(newLocation);
            void dialog.triggerSubmit();
          }
        },
        onError: (err: any) => {
          // eslint-disable-next-line no-console
          console.error('CreateLocationDialog create error', err);
          toast({ title: "Error", description: err?.message || "Failed to create location", variant: "destructive" });
        },
      });
    }
  };

  const handleOpen = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen} onSave={onSave}>
      <DialogContent data-testid="dialog-create-location">
        <DialogHeader>
          <DialogTitle>{editItem ? "Edit Location" : "Add New Location"}</DialogTitle>
          <DialogDescription>{editItem ? "Update location details" : "Search for a location using Google Maps"}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Search for Location</Label>
            <GoogleMapsLocationSearch onLocationSelect={handleLocationSelect} placeholder="Search for a location..." />
          </div>

          {placeId && (
            <Card className="bg-muted/50">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">Location Selected</div>
                    <div className="text-sm text-muted-foreground truncate mt-1">{address}</div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setPlaceId(""); setSelectedLocationName(""); }} data-testid="button-edit-address-manual">Edit address manually</Button>
                  <Button variant="default" size="sm" onClick={() => { const url = (latitude !== undefined && longitude !== undefined) ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${latitude},${longitude}`)}` : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`; try { window.open(url, '_blank', 'noopener'); } catch (e) {} }} data-testid="button-open-directions">Directions</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <InlineEdit value={name} onChange={setName} placeholder={name ? "e.g., Central Park" : (selectedLocationName || "e.g., Central Park")} type="text" data-testid="input-location-name" />
            {selectedLocationName && !name && (
              <div className="text-sm text-muted-foreground mt-1 flex items-center justify-between">
                <span>Using "{selectedLocationName}" as the default name</span>
                <Button variant="ghost" size="sm" onClick={() => { setSelectedLocationName(""); setPlaceId(""); }}>Use different name</Button>
              </div>
            )}
          </div>

          {!placeId && (
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <InlineEdit value={address} onChange={setAddress} placeholder="123 Main St, New York, NY 10001" type="text" data-testid="input-location-address" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any extra details, parking notes, building access..." rows={2} data-testid="input-location-notes" />
          </div>

          {placeId && latitude !== undefined && longitude !== undefined && (
            <div className="mt-4">
              <GoogleMap center={{ lat: latitude, lng: longitude }} zoom={15} markers={[{ position: { lat: latitude, lng: longitude }, title: name }]} />
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => handleOpen(false)} data-testid="button-cancel">Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save">{editItem ? (updateMutation.isPending ? "Updating..." : "Update") : (createMutation.isPending ? "Creating..." : "Create")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// keep default export for existing default-import usage
export default CreateLocationDialog;
