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
import { ImageUploadWithCrop } from "@/components/ImageUploadWithCrop";
import { InlineEdit } from "@/components/InlineEdit";
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
  const [notes, setNotes] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (editItem) {
      setName(editItem.name || "");
      setAddress(editItem.address || "");
      setNotes(editItem.notes || "");
      setImagePreview(editItem.imageUrl || "");
      setImageFile(null);
    }
  }, [editItem]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/locations", {
        method: "POST",
        credentials: "include",
        body: data,
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
    mutationFn: async (data: FormData) => {
      const response = await fetch(`/api/locations/${editItem!.id}`, {
        method: "PATCH",
        credentials: "include",
        body: data,
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
    setNotes("");
    setImageFile(null);
    setImagePreview("");
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

    const formData = new FormData();
    formData.append("name", name.trim());
    if (address.trim()) {
      formData.append("address", address.trim());
    }
    if (notes.trim()) {
      formData.append("notes", notes.trim());
    }
    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (editItem) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
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
            {editItem ? "Update location details" : "Create a new shoot location"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUploadWithCrop
            value={imagePreview}
            onChange={(file, preview) => {
              setImageFile(file);
              setImagePreview(preview);
            }}
            aspect={1}
          />

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
              <InlineEdit
                value={address}
                onChange={setAddress}
                placeholder="123 Main St, New York, NY 10001"
                type="text"
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
