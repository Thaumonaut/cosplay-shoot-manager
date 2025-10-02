import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { GoogleMapsLocationSearch } from "@/components/GoogleMapsLocationSearch";

interface CreateLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (location: any) => void;
}

export function CreateLocationDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateLocationDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      address?: string;
      notes?: string;
    }) => {
      const response = await apiRequest("POST", "/api/locations", data);
      return await response.json();
    },
    onSuccess: (newLocation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      toast({
        title: "Success",
        description: "Location added successfully",
      });
      setName("");
      setAddress("");
      setNotes("");
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
    createMutation.mutate({
      name: name.trim(),
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-create-location">
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
          <DialogDescription>
            Create a new shoot location
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Central Park"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-location-name"
            />
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Search for Address</Label>
              <GoogleMapsLocationSearch
                onLocationSelect={(location) => {
                  setAddress(location.address);
                  if (!name) {
                    setName(location.name || location.address.split(",")[0]);
                  }
                }}
                placeholder="Search for a location..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Or enter manually</Label>
              <Textarea
                id="address"
                placeholder="123 Main St, New York, NY 10001"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                data-testid="input-location-address"
              />
            </div>
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
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              data-testid="button-save"
            >
              {createMutation.isPending ? "Adding..." : "Add Location"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
